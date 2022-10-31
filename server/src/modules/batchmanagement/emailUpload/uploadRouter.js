const Router = require("express-promise-router");

const controller = require("./uploadController");

module.exports = () => {
  const router = Router({ mergeParams: true });

  router.route(`/list`).post(controller.listData);

  router.route(`/getTemplates/:referenceId`).get(controller.getTemplates);

  router.route(`/schedule`).post(controller.scheduleJob);

  return router;
};
