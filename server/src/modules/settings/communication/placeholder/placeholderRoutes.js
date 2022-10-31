'use strict';

const Router = require('express-promise-router');
const controller = require('./placeholderController');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({
        mergeParams: true
    });

    router.route(`/${routeName}/list`).post(ctrl.listData);

    router.route(`/${routeName}`)
        .post(ctrl.createData)

    router.route(`/${routeName}/listAll`)
        .get(ctrl.listAll)

    router.route(`/${routeName}/:placeholderId`)
        .get(ctrl.readData)
        .put(ctrl.updateData)
        .delete(ctrl.deleteData)

    // Finish by binding the team middleware
    router.param('placeholderId', ctrl.placeholderById)

    return router;
};

module.exports = () => {
    const router = defaultRoutes('placeholder', controller);
    return router
}