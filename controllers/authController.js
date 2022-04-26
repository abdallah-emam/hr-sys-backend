// const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Employee = require('../models/employeeModel');

exports.LogRestrictTo =
  (...roles) =>
  async (req, res, next) => {
    const { email } = req.body;
    // roles ['admin', 'HR']. role='user'
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!roles.includes(employee.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

exports.restrictTo =
  (...roles) =>
  async (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (employee, statusCode, res) => {
  const token = signToken(employee._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // make a cookie not modified or accessed by the browser -- make browser to store cookie and send it back ti server with request
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // cookies will only be send on an encrypted conection (HTTPs)
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  employee.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      employee,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newEmployee = await Employee.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newEmployee, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const employee = await Employee.findOne({ email }).select('+password -email');

  if (
    !employee ||
    !(await employee.correctPassword(password, employee.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(employee, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
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
  // 3) Check if contractor still exists
  const currentEmployee = await Employee.findById(decoded.id);
  if (!currentEmployee) {
    return next(
      new AppError(
        'The Employee belonging to this token does no longer exist.',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.employee = currentEmployee;
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
