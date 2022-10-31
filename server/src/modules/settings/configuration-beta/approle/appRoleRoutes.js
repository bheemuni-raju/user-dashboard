'use strict';

const Router = require('express-promise-router');
const controller = require('./appRoleController');

const { appRole } = require('../../../../lib/permissionList');
const { get } = require('lodash');

const { performAppRoutePermissionValidation } = require('../../../../common/permissionValidator');

const defaultRoutes = (routeName) => {
    const router = Router({
        mergeParams: true
    });

    let createAppRole = get(appRole, `createAppRole`).split("UMS_")[1];
    let editAppRole = get(appRole, `editAppRole`).split("UMS_")[1];
    let editAppRoleName = get(appRole, `editAppRoleName`).split("UMS_")[1];
    let deleteAppRole = get(appRole, `deleteAppRole`).split("UMS_")[1];

    router.route(`/${routeName}/list`).post(controller.listData);

    router.route(`/${routeName}`)
        .post((req, res, next) => performAppRoutePermissionValidation(req, res, next, [createAppRole]), controller.createData)

    router.route(`/${routeName}/listAll`)
        .get(controller.listAll)

    router.route(`/${routeName}/:formattedName`)
        .get(controller.readData)
        .put((req, res, next) => performAppRoutePermissionValidation(req, res, next, [editAppRole]), controller.updateData)
        .delete((req, res, next) => performAppRoutePermissionValidation(req, res, next, [deleteAppRole]), controller.deleteData)

    router.route(`/${routeName}/updateRoleName`)
        .post((req, res, next) => performAppRoutePermissionValidation(req, res, next, [editAppRoleName]), controller.updateRoleName)

    return router;  
};

module.exports = () => {
    const router = defaultRoutes('approle', controller.appRoleById);
    return router
}