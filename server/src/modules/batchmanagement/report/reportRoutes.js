const { get } = require("lodash");
const Router = require("express-promise-router");

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
const controller = require("./reportController");

module.exports = () => {
  const router = Router({ mergeParams: true });
  const batchReport = get(batch, `viewReports`);
  const umsBatchReport = get(umsBatch, `viewReports`);
  const omsBatchReport = get(omsBatch, `viewReports`);
  const fmsBatchReport = get(fmsBatch, `viewReports`);
  const sosBatchReport = get(sosBatch, `viewReports`);
  const imsBatchReport = get(imsBatch, `viewReports`);
  const lmsBatchReport = get(lmsBatch, `viewReports`);
  const pomsBatchReport = get(pomsBatch, `viewReports`);
  const cxmsBatchReport = get(cxmsBatch, `viewReports`);
  const mosBatchReport = get(mosBatch, `viewReports`);
  const dfosBatchReport = get(dfosBatch, `viewReports`);

  const permissionList = [
    batchReport,
    umsBatchReport,
    omsBatchReport,
    fmsBatchReport,
    imsBatchReport,
    sosBatchReport,
    lmsBatchReport,
    pomsBatchReport,
    cxmsBatchReport,
    mosBatchReport,
    dfosBatchReport,
  ];

  router
    .route(`/list`)
    .post(
      (req, res, next) =>
        performPermissionValidation(req, res, next, permissionList),
      controller.listData
    );

  router.route(`/groupByModuleCategoryList`).post(controller.groupByModuleList);

  router
    .route(`/:reportTemplateId`)
    .get(controller.readData)
    .put(
      (req, res, next) =>
        performPermissionValidation(req, res, next, permissionList),
      controller.updateData
    )
    .delete(controller.deleteData);

  router
    .route(`/groupByReportCategory`)
    .post(controller.getReportCategoryPermissions);

  router
    .route(`/`)
    .post(
      (req, res, next) =>
        performPermissionValidation(req, res, next, permissionList),
      controller.createData
    );

  router.route(`/schedule`).post(controller.scheduleJob);

  router.route(`/subscribe/:reportTemplateId`).post(controller.addSubscription);

  router.route("/getuniquevalues").post(controller.getUniqueValues);

  router.route(`/reportcategorymaster`).post(controller.createReportCategory);

  router
    .route(`/reportcategorymaster/groupByAppAndCategoryList`)
    .get(controller.groupByAppAndCategoryList);

  router
    .route(`/reportcategorymaster/:moduleCategory`)
    .get(controller.listData)
    .put(controller.updateReportCategory)
    .delete(controller.deleteReportCategory);

  // Finish by binding the order middleware
  router.param("reportTemplateId", controller.reportTemplateById);

  return router;
};
