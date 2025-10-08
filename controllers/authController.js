const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const College = require('../models/College');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const SuperAdmin = require('../models/SuperAdmin');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Generate JWT Token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Get model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'superadmin':
      return SuperAdmin;
    case 'college':
      return College;
    case 'teacher':
      return Teacher;
    case 'student':
      return Student;
    default:
      return null;
  }
};

// Unified login function
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  // 1) Check if email, password and role exist
  if (!email || !password || !role) {
    return next(new AppError('Please provide email, password and role!', 400));
  }

  // 2) Get the appropriate model based on role
  const Model = getModelByRole(role);
  if (!Model) {
    return next(new AppError('Invalid role specified', 400));
  }

  // 3) Check if user exists && password is correct
  const user = await Model.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 4) If everything ok, send token to client
  const token = signToken(user._id, role);
  
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role
      }
    }
  });
});

// Protect routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Get the appropriate model based on role
  const Model = getModelByRole(decoded.role);
  if (!Model) {
    return next(new AppError('Invalid role in token', 401));
  }

  // 4) Check if user still exists
  const currentUser = await Model.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  req.user.role = decoded.role;
  next();
});

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
