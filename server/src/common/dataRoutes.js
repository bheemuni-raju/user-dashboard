const Router = require('express-promise-router')
const multer = require('multer')
const {
  listData, uploadData,
  importData, downloadData,
  getColUniqueValues,
  gridFormField,
  saveUserPreferences, getQuickFilter,
  removeFavouriteFilter
} = require('./dataController');

const dataController = require('./dataController');

const { listComboData } = require('./comboController');
const { pgListComboData } = require('./pgComboController');

const { notifyComment } = require('./commentController');

var upload = multer({
  fileFilter: (req, file, cb) => {
    console.log(`MIME TYPE -==> ${req.user.email} - ${file.mimetype}`)

    if (["application/vnd.ms-excel", "application/octet-stream", "text/csv", "text/plain"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .csv format allowed!'));
    }
  }
});

module.exports = () => {
  const router = Router({ mergeParams: true })

  router.route('/grid')
    .post(listData)
  router.route('/grid/colUniqueValues')
    .get(getColUniqueValues)
  router.route('/grid/download')
    .post(downloadData)
  router.route('/grid/upload')
    .post(upload.single('file'), uploadData)
  router.route('/grid/import')
    .post(upload.single('file'), importData)

  router.route('/getFields/:type')
    .get(gridFormField)

  router.route('/model/list')
    .post(dataController.getModelList);

  router.route('/model/column/list')
    .post(dataController.getColumnList);
  
  router.route('/model/pgList')
  .post(dataController.getPgModelList);
  
  router.route('/model/column/pgList')
  .post(dataController.getPgColumnList);

  router.route('/model/associations/pgList/:modelName')
  .get(dataController.getPgModelAssociations);  

  router.route('/model/associations/column/pgList')
  .post(dataController.getPgModelAssociatedColumns);

  router.route('/model/sqlList')
    .post(dataController.getSQLModelList);

  router.route('/model/column/sqlList')
    .post(dataController.getSQLColumnList);

  router.route('/model/associations/list/:modelName')
    .get(dataController.getSQLModelAssociations);  
  
  router.route('/model/associations/column/list')
    .post(dataController.getSQLModelAssociatedColumns);

  router.route('/favouriteFilter/:gridId/:userId')
    .get(dataController.getFavouriteFilter);

  router.route('/save/preferences')
    .post(saveUserPreferences)

  router.route('/remove/favouriteFilter')
    .put(removeFavouriteFilter)

  /**Combobox routes */
  router.route('/combo')
    .post(listComboData)

  /**Pg Combobox routes */
  router.route('/pgcombo')
    .post(pgListComboData)

  /**Comment routes */
  router.route('/comment/notify')
    .post(notifyComment)

  return router
}
