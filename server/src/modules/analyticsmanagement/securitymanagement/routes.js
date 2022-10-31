// eslint-disable-next-line strict
const Router = require("express-promise-router");
const multer = require("multer");

const controller = require("./controller");

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (
      [
        "application/vnd.ms-excel",
        "application/octet-stream",
        "application/pdf",
        "text/csv",
        "text/plain",
        "image/jpeg",
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

  router.route(`/list`).post(controller.listData);

  router.route(`/getDetails`).post(controller.getDetails);

  router
    .route(`/createReport`)
    .post(upload.single("uploadedFile"), controller.createReport);

  router
    .route(`/report`)
    .post(upload.single("uploadedFile"), controller.updateReport)
    .put(controller.updateReport)
    .delete(controller.deleteReport);

  router.route(`/getApplications`).post(controller.getAllApplications);

  return router;
};
