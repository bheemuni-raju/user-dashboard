const Router = require("express-promise-router");
const { get } = require("lodash");

const controller = require("./jobDefinitionController");
const validator = require("./validator");
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

  router.route(`/`).post(validator.createJobDefinition, controller.createData);

  router
    .route(`/list`)
    .post(
      (req, res, next) =>
        performPermissionValidation(req, res, next, permissionList),
      controller.listData
    );

  router.route(`/syncWithAws`).post(controller.syncWithAws);

  router
    .route(`/:jobDefinitionId`)
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData);

  router.route(`/:jobDefinitionId/deregister`).delete(controller.deRegister);

  // Finish by binding the order middleware
  router.param("jobDefinitionId", controller.jobDefinitionById);

  return router;
};
