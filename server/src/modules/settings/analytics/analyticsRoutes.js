'use strict';

const Router = require('express-promise-router');
const controller = require('./analyticsController');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({
        mergeParams: true
    });

    router.route(`/${routeName}/listUser`).post(ctrl.listUser);

    router.route(`/${routeName}/listRole`).post(ctrl.listRole);

    router.route(`/${routeName}/listAllUsers`)
        .get(ctrl.listAllUsers)

    router.route(`/${routeName}/listAllRoles`)
        .get(ctrl.listAllRoles)

    return router;
};

module.exports = () => {
    const router = defaultRoutes('analytics', controller);
    return router
}