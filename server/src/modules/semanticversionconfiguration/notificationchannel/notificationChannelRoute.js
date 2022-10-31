const Router = require("express-promise-router");

const controller = require("./notificationChannelController");

module.exports = () => {
  const router = Router({ mergeParams: true });
  router.route("/list").post(controller.notificationChannelList);
  router.route("/create").post(controller.createNotificationChannel);
  router.route("/create/:id").put(controller.updateNotificationChannel);
  router.route("/delete").put(controller.deleteNotificationChannel);

  return router;
};
