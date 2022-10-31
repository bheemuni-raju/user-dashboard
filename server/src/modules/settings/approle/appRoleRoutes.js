'use strict';

const Router = require('express-promise-router');
const controller = require('./appRoleController');

const { appRole } = require('../../../lib/permissionList');
const { get } = require('lodash');

const { performAppRoutePermissionValidation } = require('../../../common/permissionValidator');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({
        mergeParams: true
    });

    let createAppRole = get(appRole, `createAppRole`).split("UMS_")[1];
    let editAppRole = get(appRole, `editAppRole`).split("UMS_")[1];
    let editAppRoleName = get(appRole, `editAppRoleName`).split("UMS_")[1];
    let deleteAppRole = get(appRole, `deleteAppRole`).split("UMS_")[1];

    router.route(`/${routeName}/list`).post(ctrl.listData);

    router.route(`/${routeName}`)
        .post((req, res, next) => performAppRoutePermissionValidation(req, res, next, [createAppRole]), ctrl.createData)

    router.route(`/${routeName}/listAll`)
        .get(ctrl.listAll)

    router.route(`/${routeName}/:appRoleFormattedName`)
        .get(ctrl.readData)
        .put((req, res, next) => performAppRoutePermissionValidation(req, res, next, [editAppRole]), ctrl.updateData)
        .delete((req, res, next) => performAppRoutePermissionValidation(req, res, next, [deleteAppRole]), ctrl.deleteData)

    router.route(`/${routeName}/updateRoleName`)
        .post((req, res, next) => performAppRoutePermissionValidation(req, res, next, [editAppRoleName]), ctrl.updateRoleName)

    return router;  
};

module.exports = () => {
    const router = defaultRoutes('approle', controller);
    return router
}