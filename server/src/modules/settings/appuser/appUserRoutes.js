'use strict';

const Router = require('express-promise-router');
const controller = require('./appUserController');

const { appUser } = require('../../../lib/permissionList');
const { get } = require('lodash');

const { performAppRoutePermissionValidation } = require('../../../common/permissionValidator');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({
        mergeParams: true
    });

    let createAppUser = get(appUser, `createAppUser`).split("UMS_")[1];
    let editAppUser = get(appUser, `editAppUser`).split("UMS_")[1];
    let deleteAppUser = get(appUser, `deleteAppUser`).split("UMS_")[1];

    router.route(`/${routeName}/list`).post(ctrl.listData);

    router.route(`/${routeName}`)
        .post((req, res, next) => performAppRoutePermissionValidation(req, res, next, [createAppUser]), ctrl.createData)

    router.route(`/${routeName}/listAll`)
        .get(ctrl.listAll)

    router.route(`/${routeName}/:appUserEmail`)
        .get(ctrl.readData)
        .put((req, res, next) => performAppRoutePermissionValidation(req, res, next, [editAppUser]), ctrl.updateData)
        .delete((req, res, next) => performAppRoutePermissionValidation(req, res, next, [deleteAppUser]), ctrl.deleteData)

    router.route(`/${routeName}/assign`)
        .post((req, res, next) => performAppRoutePermissionValidation(req, res, next, [createAppUser]), ctrl.assignApplicationRole)

    router.route(`/${routeName}/heartbeat`)
        .post(ctrl.sendUserHeartBeat)

    return router;
};

module.exports = () => {
    const router = defaultRoutes('appuser', controller);
    return router
}