const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.ObjectId,
      ref: 'Employee',
      required: [true, 'attendance must belong to en employee'],
    },
    day: {
      type: String,
      required: [true, 'Attendance must have a day'],
    },
    present: {
      type: String,
      required: [true, 'please spcifiy the present state'],
      enum: ['presence', 'absence'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const Attendance = mongoose.model('Atten', attendanceSchema);

module.exports = Attendance;
