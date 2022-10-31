const Router = require('express-promise-router')
const controller = require('./organizationController')

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/getOrgByIdOrName/:orgId').get(controller.getOrganizationByIdOrName);

    router.route('/supportedEmails').get(controller.getSupportedEmails)

    router.route(`/list`)
        .post(controller.listData)
    router.route(`/colUniqueValues`)
        .get(controller.getColUniqueValues)
    router.route(`/download`)
        .post(controller.downloadData)

    router.route('/')
        .post(controller.createData)

    router.route('/listAll')
        .get(controller.listAll)

    router.route('/:organizationId')
        .get(controller.readData)
        .put(controller.updateData)
        .delete(controller.deleteData)

    // Finish by binding the team middleware
    router.param('organizationId', controller.organizationById)

    return router
}