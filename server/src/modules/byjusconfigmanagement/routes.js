const express = require('express');
const controller = require('./byjusConfigController');
const Router = require('express-promise-router');
const middlewareRoutes = require('./middleware/middlewareRoutes');

/**
 * Add here application routes
 */
module.exports = () => {
  const router = express.Router()
    .use(byjusConfigRoutes())
    .use(middlewareRoutes());

  return router;
}

/**
 * Routes only for root label apis.
 * Could have been created a new route file.
 */
const byjusConfigRoutes = () => {
  const router = Router({ mergeParams: true });
  const routeName = "/byjusconfig";

  router.route(`${routeName}/list`)
    .post(controller.listData);
  router.route(`${routeName}/addConfig`)
    .post(controller.addConfig);
  router.route(`${routeName}/editConfig`)
    .post(controller.editConfig);
  router.route(`${routeName}/logisticusers`)
    .get(controller.listLogisticsUsers);

  return router;
}
