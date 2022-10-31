const Router = require('express-promise-router')
const multer = require('multer')
const upload = multer()
const controller = require('./gridTemplateController')

const defaultRoutes = (routeName, controller) => {
    const router = Router({ mergeParams: true })

    router.route(`/${routeName}/list`)
        .post(controller.listData)
    router.route(`/${routeName}/colUniqueValues`)
        .get(controller.getColUniqueValues)
    router.route(`/${routeName}/download`)
        .post(controller.downloadData)
    router.route(`/${routeName}/upload`)
        .post(upload.single('file'), controller.uploadData)
    router.route(`/${routeName}/import`)
        .post(upload.single('file'), controller.importData)
    return router
}

module.exports = () => {
    const router = defaultRoutes('gridtemplate', controller)

    router.route('/support/gridtemplate/getDbCollections')
        .post(controller.getDbCollections);

    router.route('/support/gridtemplate/getModelColumns')
        .post(controller.getModelColumns);

    router.route('/support/gridtemplate')
        .post(controller.createGridTemplate);

    router.route('/support/gridtemplate')
        .get(controller.readGridTemplate)
        .put(controller.updateGridTemplate);

    router.route('/support/gridtemplate/:gridId')
        .delete(controller.deleteGridTemplate);

    // Finish by binding the order middleware
    router.param('gridId', controller.gridTemplateByGridId);

    return router
}
