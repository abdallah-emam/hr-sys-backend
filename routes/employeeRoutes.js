const express = require('express');
const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authController');
const attendanceRouter = require('./attendanceRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:empId/attendance', attendanceRouter);

router.post('/signup', authController.signup);
router.post('/login', authController.LogRestrictTo('HR'), authController.login);
router.get('/logout', authController.logout);
// router.get('/logout', authController.logout);

router.use(authController.protect);
router.use(authController.restrictTo('HR'));

router.post('/addEmployee', employeeController.addEmployee);
router.get('/allEmployee', employeeController.findAllEmployee);
// router.get('/:employeeId', employeeController.updateEmployee);
// router.patch('/:employeeId', employeeController.updateEmployee);
router
  .route('/:employeeId')
  .get(employeeController.getEmployee)
  .patch(employeeController.updateEmployee);
module.exports = router;
