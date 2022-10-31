'use strict';

const Router = require('express-promise-router');
const controller = require('./smsTransactionsController');

const defaultRoutes = (routeName, ctrl) => {
  const router = Router({
    mergeParams: true
  });

  router.route(`/${routeName}/list`).post(ctrl.listData);

  router.route(`/${routeName}/listAll`)
    .get(ctrl.listAll)

  router.route(`/${routeName}/transactionByTemplate/:smsTemplateId`)
    .get(ctrl.transactionsByTemplateId)

  router.route(`/${routeName}/:smsTransactionId`)
    .get(ctrl.readData)

  router.param('', ctrl.transactionById)

  router.route(`/${routeName}/sendSms`)
    .post(ctrl.sendSms)

  return router;
};

module.exports = () => {
  const router = defaultRoutes('smstransactions', controller);
  return router
}