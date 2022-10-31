// eslint-disable-next-line strict
const Router = require("express-promise-router");

const controller = require("./controller");
const summaryController = require("./summary");

module.exports = () => {
  const router = Router({ mergeParams: true });

  router.route(`/list`).post(controller.listData);

  router.route(`/getDetails`).post(controller.getDetails);

  router
    .route(`/getDevopsInfraRequestOverview`)
    .post(summaryController.getDevopsInfraRequestOverview);

  router.route(`/getComments`).post(controller.getComments);

  router.route(`/addComment`).post(controller.addComment);

  router.route(`/createRequest`).post(controller.createRequest);

  router.route(`/updateRequestStatus`).post(controller.updateRequestStatus);

  return router;
};
