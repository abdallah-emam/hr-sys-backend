const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Employee = require('../models/employeeModel');

exports.addEmployee = catchAsync(async (req, res, next) => {
  const newEmployee = await Employee.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Remove password from output
  newEmployee.password = undefined;

  res.status(201).json({
    status: 'success',
    data: newEmployee,
  });
});

exports.findAllEmployee = catchAsync(async (req, res, next) => {
  const allNormalEmployee = await Employee.find({ role: 'employee' });

  if (!allNormalEmployee) {
    return res.status(204).json({
      status: 'Success',
      result: allNormalEmployee.length,
      data: null,
    });
  }

  res.status(200).json({
    status: 'Success',
    result: allNormalEmployee.length,
    data: allNormalEmployee,
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const bodyObj = { ...req.body };
  const excludedFields = ['role', 'password', 'passwordConfirm'];
  excludedFields.forEach((el) => delete bodyObj[el]);

  const employee = await Employee.findByIdAndUpdate(
    req.params.employeeId,
    bodyObj,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!employee) {
    return next(new AppError('No Document was found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: employee,
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const emp = await Employee.findById(req.params.employeeId);

  if (!emp) {
    return next(new AppError('No employee found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: emp,
  });
});
