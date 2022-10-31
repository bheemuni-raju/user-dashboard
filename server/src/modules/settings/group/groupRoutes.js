const Router = require('express-promise-router')
const controller = require('./groupController')

const defaultRoutes = (routeName, controller) => {




    return router
}

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route(`/list`)
        .post(controller.listData)

    router.route(`/colUniqueValues`)
        .get(controller.getColUniqueValues)

    router.route('/')
        .post(controller.createData)

    router.route('/:groupFormattedName')
        .get(controller.readData)
        .put(controller.updateData)
        .delete(controller.deleteData)

    router.route('/assignUser')
        .post(controller.assignUser)
    router.route('/unassignUser')
        .post(controller.unassignUser)

    router.route('/addManager')
        .post(controller.addGroupManager)
    router.route('/updateManager')
        .post(controller.updateGroupManager)
    router.route('/deleteManager')
        .post(controller.deleteGroupManager)

    router.route('/assignPermissionTemplate')
        .post(controller.assignPermissionTemplate)
    router.route('/unassignPermissionTemplate')
        .post(controller.unassignPermissionTemplate)

    // Finish by binding the team middleware
    router.param('groupFormattedName', controller.groupByFormattedName)

    return router;
}