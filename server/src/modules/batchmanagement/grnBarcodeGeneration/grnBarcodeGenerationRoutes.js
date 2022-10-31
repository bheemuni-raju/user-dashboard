const Router = require("express-promise-router");

const controller = require("./grnBarcodeGenerationController");

module.exports = () => {
  const router = Router({ mergeParams: true });

  router.route("/startJob").post(controller.startJob);

  return router;
};
