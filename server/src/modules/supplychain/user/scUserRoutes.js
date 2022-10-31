'use strict';

const Router = require('express-promise-router');
const sccontroller = require('./scUserController');
const scSummaryController = require('./scSummaryController');

const assignModel = (req, res, next) => {
  req.model = "ScEmployee";

  next();
}

module.exports = () => {
  const router = Router({ mergeParams: true });

  router.route('/listData').post(assignModel, sccontroller.listData);
  router.route('/createData').post(assignModel, sccontroller.createData);
  router.route('/updateData').post(assignModel, sccontroller.updateUserDetails);
  router.route('/readData/:email').get(assignModel, sccontroller.readData)
  router.route('/getComments').get(assignModel, sccontroller.getUserComments);
  router.route('/updateComments').put(assignModel, sccontroller.updateUserComments);
  router.route('/getSummary').post(scSummaryController.getSummary);
  return router;
};
