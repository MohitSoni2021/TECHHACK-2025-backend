const BaseController = require('./baseController');
const Team = require('../models/Team');
const Student = require('../models/Student');

class TeamController extends BaseController {
  constructor() {
    super(Team);
  }

  // Add Team-specific controller methods here
  // For example:
  // getByEvent = async (req, res) => { ... }
  // getByCollege = async (req, res) => { ... }
  // addMember = async (req, res) => { ... }
  // removeMember = async (req, res) => { ... }

  // Helper: given an input array of members (emails or objects with email),
  // resolve to students and return their IDs. Optionally validate names if provided.
  resolveMembersByEmail = async (membersInput) => {
    // membersInput can be ["email@x"], or [{ email, name }]
    const emails = (membersInput || [])
      .map(m => (typeof m === 'string' ? m : m?.email))
      .filter(Boolean);
    if (emails.length === 0) return { students: [], notFound: [] };

    const students = await Student.find({ email: { $in: emails } }).select('_id email name');
    const foundByEmail = new Map(students.map(s => [s.email, s]));

    const resolved = [];
    const notFound = [];
    for (const m of membersInput) {
      const email = typeof m === 'string' ? m : m?.email;
      const name = typeof m === 'object' ? m?.name : undefined;
      const s = email ? foundByEmail.get(email) : undefined;
      if (!s) {
        notFound.push({ email, reason: 'No student with this email' });
        continue;
      }
      if (name && s.name !== name) {
        // Name mismatch warning; still allow if email matches, but report
        // Caller may decide to treat as error later
        resolved.push({ id: s._id, email, nameMismatch: true });
      } else {
        resolved.push({ id: s._id, email, nameMismatch: false });
      }
    }
    return { students: resolved, notFound };
  };

  // POST /api/teams
  // Accepts payload like:
  // {
  //   event: "<EVENT_ID>",
  //   teamName: "Alpha",
  //   leader: "leader@email.com" | { email, name },
  //   members: ["a@x", { email: "b@x", name: "B" }]
  // }
  create = async (req, res) => {
    try {
      const { event, teamName, leader, members } = req.body || {};
      if (!event || !teamName || !leader || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide event, teamName, leader, and non-empty members array',
        });
      }

      // Resolve members by email
      const { students: resolvedMembers, notFound } = await this.resolveMembersByEmail(members);
      if (notFound.length) {
        return res.status(400).json({ status: 'fail', message: 'Some members not found by email', data: { notFound } });
      }
      const memberIds = resolvedMembers.map(s => s.id);

      // Resolve leader
      const leaderEmail = typeof leader === 'string' ? leader : leader?.email;
      const leaderName = typeof leader === 'object' ? leader?.name : undefined;
      let leaderStudent;
      if (leaderEmail) {
        leaderStudent = await Student.findOne({ email: leaderEmail }).select('_id email name');
        if (!leaderStudent) {
          return res.status(400).json({ status: 'fail', message: 'Leader not found by email' });
        }
        if (leaderName && leaderStudent.name !== leaderName) {
          return res.status(400).json({ status: 'fail', message: 'Leader name does not match the record' });
        }
      } else {
        // If leader provided as id (fallback)
        leaderStudent = await Student.findById(leader).select('_id');
        if (!leaderStudent) return res.status(400).json({ status: 'fail', message: 'Leader not found by id' });
      }

      // Ensure leader is in members
      if (!memberIds.some(id => id.toString() === leaderStudent._id.toString())) {
        memberIds.push(leaderStudent._id);
      }

      // Validate max members (<=10)
      if (memberIds.length > 10) {
        return res.status(400).json({ status: 'fail', message: 'A team can have at most 10 members' });
      }

      // Ensure no member already in another team for this event
      const conflict = await this.model.findOne({ event, members: { $in: memberIds } }).select('_id teamName');
      if (conflict) {
        return res.status(400).json({ status: 'fail', message: 'One or more members are already in a team for this event' });
      }

      // Create team
      const team = await this.model.create({ event, teamName, members: memberIds, leader: leaderStudent._id });

      // Update each member's eventsParticipated
      await Student.updateMany(
        { _id: { $in: memberIds } },
        { $addToSet: { eventsParticipated: event } }
      );

      const populated = await this.model
        .findById(team._id)
        .populate('members', 'name email college')
        .populate('leader', 'name email college');

      return res.status(201).json({ status: 'success', data: { team: populated } });
    } catch (error) {
      return res.status(400).json({ status: 'fail', message: 'Team creation failed', error: error.message });
    }
  };

  // GET /api/teams/event/:eventId
  getByEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const teams = await this.model
        .find({ event: eventId })
        .populate('members', 'name email college')
        .populate('leader', 'name email college');
      return res.status(200).json({ status: 'success', results: teams.length, data: { teams } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Failed to fetch teams by event', error: error.message });
    }
  };

  // GET /api/teams/college/:collegeId
  getByCollege = async (req, res) => {
    try {
      const { collegeId } = req.params;
      const students = await Student.find({ college: collegeId }).select('_id');
      const studentIds = students.map(s => s._id);

      if (studentIds.length === 0) {
        return res.status(200).json({ status: 'success', results: 0, data: { teams: [] } });
      }

      const teams = await this.model
        .find({ members: { $in: studentIds } })
        .populate('members', 'name email college')
        .populate('leader', 'name email college');
      return res.status(200).json({ status: 'success', results: teams.length, data: { teams } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Failed to fetch teams by college', error: error.message });
    }
  };

  // POST /api/teams/:id/members
  addMember = async (req, res) => {
    try {
      const { id } = req.params; // team id
      const { studentId, email, name } = req.body || {};
      if (!studentId && !email) {
        return res.status(400).json({ status: 'fail', message: 'Provide studentId or email' });
      }

      const team = await this.model.findById(id);
      if (!team) return res.status(404).json({ status: 'fail', message: 'Team not found' });

      // Ensure member limit (max 10)
      if (team.members.length >= 10) {
        return res.status(400).json({ status: 'fail', message: 'Team already has maximum number of members (10)' });
      }

      // Resolve student by email or id
      let student;
      if (email) {
        student = await Student.findOne({ email }).select('_id name email');
        if (!student) return res.status(404).json({ status: 'fail', message: 'Student not found by email' });
        if (name && student.name !== name) {
          return res.status(400).json({ status: 'fail', message: 'Provided name does not match student record' });
        }
      } else {
        student = await Student.findById(studentId).select('_id name email');
        if (!student) return res.status(404).json({ status: 'fail', message: 'Student not found by id' });
      }

      // Prevent duplicates in same team
      if (team.members.some(m => m.toString() === student._id.toString())) {
        return res.status(400).json({ status: 'fail', message: 'Student is already a member of this team' });
      }

      // Ensure student is not already in another team for this event
      const existsInEvent = await this.model.findOne({ event: team.event, members: student._id });
      if (existsInEvent) {
        return res.status(400).json({ status: 'fail', message: 'Student already in a team for this event' });
      }

      team.members.push(student._id);
      await team.save();

      // Update student's eventsParticipated
      await Student.updateOne(
        { _id: student._id },
        { $addToSet: { eventsParticipated: team.event } }
      );

      const populated = await this.model
        .findById(team._id)
        .populate('members', 'name email college')
        .populate('leader', 'name email college');

      return res.status(200).json({ status: 'success', message: 'Member added', data: { team: populated } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Failed to add member', error: error.message });
    }
  };

  // DELETE /api/teams/:id/members/:memberId
  removeMember = async (req, res) => {
    try {
      const { id, memberId } = req.params; // team id and member id
      const team = await this.model.findById(id);
      if (!team) return res.status(404).json({ status: 'fail', message: 'Team not found' });

      // Prevent removing leader directly
      if (team.leader && team.leader.toString() === memberId) {
        return res.status(400).json({ status: 'fail', message: 'Cannot remove leader. Assign a new leader first.' });
      }

      const initialLen = team.members.length;
      team.members = team.members.filter(m => m.toString() !== memberId);
      if (team.members.length === initialLen) {
        return res.status(404).json({ status: 'fail', message: 'Member not found in this team' });
      }

      await team.save();

      const populated = await this.model
        .findById(team._id)
        .populate('members', 'name email college')
        .populate('leader', 'name email college');

      return res.status(200).json({ status: 'success', message: 'Member removed', data: { team: populated } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Failed to remove member', error: error.message });
    }
  };
}

module.exports = new TeamController();
