const { get } = require("lodash");
const Router = require("express-promise-router");

const controller = require("./jobController");
const jobSummaryController = require("./jobSummaryController");
const {
  batch,
  omsBatch,
  imsBatch,
  fmsBatch,
  sosBatch,
  lmsBatch,
  pomsBatch,
  umsBatch,
  cxmsBatch,
  mosBatch,
  dfosBatch,
} = require("../../../lib/permissionList");
const {
  performPermissionValidation,
} = require("../../../common/permissionValidator");

module.exports = () => {
  const router = Router({ mergeParams: true });
  const batchJobs = get(batch, `viewJobs`);
  const umsBatchJobs = get(umsBatch, `viewJobs`);
  const omsBatchJobs = get(omsBatch, `viewJobs`);
  const fmsBatchJobs = get(fmsBatch, `viewJobs`);
  const sosBatchJobs = get(sosBatch, `jobView`);
  const imsBatchJobs = get(imsBatch, `viewJobs`);
  const lmsBatchJobs = get(lmsBatch, `viewJobs`);
  const pomsBatchJobs = get(pomsBatch, `viewJobs`);
  const cxmsBatchJobs = get(cxmsBatch, `viewJobs`);
  const mosBatchJobs = get(mosBatch, `viewJobs`);
  const dfosBatchJobs = get(dfosBatch, `viewJobs`);

  const permissionList = [
    batchJobs,
    umsBatchJobs,
    omsBatchJobs,
    fmsBatchJobs,
    imsBatchJobs,
    sosBatchJobs,
    lmsBatchJobs,
    pomsBatchJobs,
    cxmsBatchJobs,
    mosBatchJobs,
    dfosBatchJobs,
  ];

  router.route(`/`).post(controller.createData);

  router.route(`/submitJob`).post(controller.submitJob);

  router
    .route(`/list`)
    .post(
      (req, res, next) =>
        performPermissionValidation(req, res, next, permissionList),
      controller.listData
    );

  router
    .route(`/:jobId`)
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData);

  router.route(`/getLogs`).post(controller.getLogs);

  router.route(`/summary`).post(jobSummaryController.getSummary);

  // Finish by binding the order middleware
  router.param("jobId", controller.jobById);

  return router;
};
