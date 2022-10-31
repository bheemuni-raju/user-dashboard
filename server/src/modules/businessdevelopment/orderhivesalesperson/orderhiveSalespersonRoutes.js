'use strict';

const Router = require('express-promise-router');
const controller = require('./orderhiveSalespersonController');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({ mergeParams: true });

    router.route(`/${routeName}/list`).post(ctrl.listData);
    router.route(`/${routeName}/colUniqueValues`).get(ctrl.getColUniqueValues);
    router.route(`/${routeName}/download`).post(ctrl.downloadData);

    return router;
};

module.exports = () => {
    const router = defaultRoutes('orderhive', controller);

    router.route('/')
        .post(controller.createData)
        .get(controller.readData)
        .put(controller.updateData)
        .delete(controller.deleteData);

    router.route('/syncOhUserId')
        .post(controller.syncOhUserId)

    router.route('/createUserInOH')
        .post(controller.createUserInOH)

    return router;
};
