'use strict';

const Router = require('express-promise-router');
const controller = require('./smsProviderController');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({
        mergeParams: true
    });

    router.route(`/${routeName}/list`).post(ctrl.listData);

    router.route(`/${routeName}/colUniqueValues`)
        .get(ctrl.getColUniqueValues)
    router.route(`/${routeName}/download`)
        .post(ctrl.downloadData)

    router.route(`/${routeName}`)
        .post(ctrl.createData)

    router.route(`/${routeName}/listAll`)
        .get(ctrl.listAll)

    router.route(`/${routeName}/:smsProviderId`)
        .get(ctrl.readData)
        .put(ctrl.updateData)
        .delete(ctrl.deleteData)

    // Finish by binding the team middleware
    router.param('smsProviderId', ctrl.smsProviderById)

    return router;
};

module.exports = () => {
    const router = defaultRoutes('smsprovider', controller);
    return router
}