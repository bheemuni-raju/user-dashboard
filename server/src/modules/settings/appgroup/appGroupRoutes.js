'use strict';

const Router = require('express-promise-router');
const controller = require('./appGroupController');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({
        mergeParams: true
    });

    router.route(`/${routeName}/list`).post(ctrl.listData);

    router.route(`/${routeName}`)
        .post(ctrl.createData)

    router.route(`/${routeName}/listAll`)
        .get(ctrl.listAll)

    router.route(`/${routeName}/:appGroupName`)
        .get(ctrl.readData)
        .put(ctrl.updateData)
        .delete(ctrl.deleteData)

    router.route(`/${routeName}/assign`)
        .post(controller.assignAppGroups)

    router.route(`/${routeName}/unassign`)
        .post(controller.unassignAppGroups)

    return router;
};

module.exports = () => {
    const router = defaultRoutes('appgroup', controller);
    return router
}