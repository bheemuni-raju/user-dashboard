const { get } = require("lodash");
const Router = require("express-promise-router");
const multer = require("multer");

const controller = require("./uploadController");
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

const upload = multer({
  fileFilter: (req, file, cb) => {
    console.log(`MIME TYPE -==> ${req.user.email} - ${file.mimetype}`);

    if (
      [
        "application/vnd.ms-excel",
        "application/octet-stream",
        "text/csv",
        "text/plain",
      ].includes(file.mimetype)
    ) {
      return cb(null, true);
    }
    cb(null, false);
    return cb(new Error("Only .csv format allowed!"));
  },
});

module.exports = () => {
  const router = Router({ mergeParams: true });
  const batchUploads = get(batch, `uploadJobs`);
  const umsBatchUploads = get(umsBatch, `viewUploads`);
  const omsBatchUploads = get(omsBatch, `uploadJobs`);
  const fmsBatchUploads = get(fmsBatch, `uploadJobs`);
  const sosBatchUploads = get(sosBatch, `viewUpload`);
  const imsBatchUploads = get(imsBatch, `uploadJobs`);
  const lmsBatchUploads = get(lmsBatch, `uploadJobs`);
  const pomsBatchUploads = get(pomsBatch, `uploadJobs`);
  const cxmsBatchUploads = get(cxmsBatch, `uploadJobs`);
  const mosBatchUploads = get(mosBatch, `uploadJobs`);
  const dfosBatchUploads = get(dfosBatch, `uploadJobs`);

  const permissionList = [
    batchUploads,
    umsBatchUploads,
    omsBatchUploads,
    fmsBatchUploads,
    imsBatchUploads,
    sosBatchUploads,
    lmsBatchUploads,
    pomsBatchUploads,
    cxmsBatchUploads,
    mosBatchUploads,
    dfosBatchUploads,
  ];
  router
    .route(`/list`)
    .post(
      (req, res, next) =>
        performPermissionValidation(req, res, next, permissionList),
      controller.listData
    );

  router
    .route(`/:templateId`)
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData);

  router.route(`/`).post(controller.createData);

  router
    .route(`/uploaddata`)
    .post(upload.single("uploadedFile"), controller.uploadData);

  router.route(`/schedule`).post(controller.scheduleJob);

  // Finish by binding the order middleware
  router.param("templateId", controller.templateById);

  return router;
};
