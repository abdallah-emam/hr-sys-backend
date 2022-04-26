const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['HR', 'employee'],
    default: 'employee',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'minimum password is 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

employeeSchema.pre('save', async function (next) {
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

employeeSchema.methods.correctPassword = async function (
  candidatePassword,
  employeePassword
) {
  return await bcrypt.compare(candidatePassword, employeePassword);
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
