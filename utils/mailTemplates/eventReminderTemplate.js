/**
 * Event reminder email template
 * @param {Object} params
 * @param {string} params.recipientName
 * @param {string} params.eventName
 * @param {string} params.eventDateTime - Human-readable date/time string
 * @param {string} [params.location]
 * @param {string} params.appName
 * @returns {{ subject: string, html: string, text: string }}
 */
function eventReminderTemplate({ recipientName, eventName, eventDateTime, location, appName }) {
	const subject = `Reminder: ${eventName} on ${eventDateTime}`;
	const text = `Hi ${recipientName},\n\nThis is a reminder for ${eventName} scheduled on ${eventDateTime}${location ? ` at ${location}` : ''}.\n\nSee you there!\n${appName} Team`;
	const html = `
		<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
			<h2>Event Reminder</h2>
			<p>Hi <strong>${recipientName}</strong>,</p>
			<p>This is a reminder for <strong>${eventName}</strong> scheduled on <strong>${eventDateTime}</strong>${location ? ` at <strong>${location}</strong>` : ''}.</p>
			<p>See you there!<br/>${appName} Team</p>
		</div>
	`;
	return { subject, html, text };
}

module.exports = eventReminderTemplate;


