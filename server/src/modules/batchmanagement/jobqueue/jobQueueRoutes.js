const { get } = require("lodash");
const Router = require("express-promise-router");

const controller = require("./jobQueueController");
const {
  batch,
  imsBatch,
  sosBatch,
  pomsBatch,
  umsBatch,
  omsBatch,
  cxmsBatch,
} = require("../../../lib/permissionList");
const {
  performPermissionValidation,
} = require("../../../common/permissionValidator");

module.exports = () => {
  const router = Router({ mergeParams: true });
  const batchJobs = get(batch, `viewJobs`);
  const umsBatchJobs = get(umsBatch, `viewJobs`);
  const sosBatchJobs = get(sosBatch, `jobView`);
  const imsBatchJobs = get(imsBatch, `viewJobs`);
  const pomsBatchJobs = get(pomsBatch, `viewJobs`);
  const omsBatchJobs = get(omsBatch, `viewJobs`);
  const cxmsBatchJobs = get(cxmsBatch, `viewJobs`);

  const permissionList = [
    batchJobs,
    umsBatchJobs,
    imsBatchJobs,
    sosBatchJobs,
    pomsBatchJobs,
    omsBatchJobs,
    cxmsBatchJobs,
  ];

  router
    .route(`/list`)
    .post(
      (req, res, next) =>
        performPermissionValidation(req, res, next, permissionList),
      controller.listData
    );

  return router;
};
