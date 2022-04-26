const express = require('express');
const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('HR'));

router
  .route('/')
  .get(attendanceController.getAllEmployeeAtte)
  .post(attendanceController.addAtt);

router
  .route('/:attId')
  .patch(attendanceController.updateAtt)
  .delete(attendanceController.deleteAtt);

module.exports = router;
