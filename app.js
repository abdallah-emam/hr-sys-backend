const express = require('express');

const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const employeeRouter = require('./routes/employeeRoutes');
const attendanceRouter = require('./routes/attendanceRoutes');

const app = express();
// 1) Global middilware
// Enable All CORS Requests
app.use(cors());

// SET security HTTP header
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    // ...
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// // Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
// });
// app.use('/api', limiter);

// Boddy Parser, reading date from body to req.body
app.use(express.json()); // express.json({limit : '10kb'})

// Data sanitize aginst noSQL Query injection
app.use(mongoSanitize()); //look at req.body, req.Str and req.parms and filter out all od the $ and dot

// Data sanitize aginst XSS
app.use(xss()); // cean up any user input from malicouis HTML code

// 3) ROUTES
app.use('/api/v1/employee', employeeRouter);
app.use('/api/v1/attendance', attendanceRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
