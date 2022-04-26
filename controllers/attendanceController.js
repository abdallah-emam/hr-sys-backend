const Attendance = require('../models/attendanceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllEmployeeAtte = catchAsync(async (req, res, next) => {
  const attendance = await Attendance.find({ employee: req.params.empId });

  res.status(200).json({
    status: 'success',
    results: attendance.length,
    data: {
      attendance,
    },
  });
});

exports.addAtt = catchAsync(async (req, res, next) => {
  req.body.employee = req.params.empId;
  const newAtt = await Attendance.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newAtt,
  });
});

exports.updateAtt = catchAsync(async (req, res, next) => {
  const attUpdated = await Attendance.findByIdAndUpdate(
    req.params.attId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!attUpdated) {
    return next(new AppError('no attendance found with that ID', 400));
  }

  res.status(200).json({
    status: 'success',
    data: attUpdated,
  });
});

exports.deleteAtt = catchAsync(async (req, res, next) => {
  const doc = await Attendance.findByIdAndDelete(req.params.attId);

  if (!doc) {
    return next(new AppError('no attendance found with that ID', 400));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
