const { } = require('../lib/permissionList');
const { intersection, isArray, get } = require('lodash');

const performPermissionValidation = (req, res, next, permissionName) => {
    let { permissions = [] } = req.user || {};
    permissionName = isArray(permissionName) ? permissionName : [permissionName];
    if (!intersection(permissionName, permissions).length) {
        return res.status(403).json(sendValidationError());
    }
    next();
}

const performAppRoutePermissionValidation = (req, res, next, permissionName) => {
    let { permissions = [] } = req.user || {};
    let appName = get(req, "headers.x-app-origin", "").toUpperCase();
    permissionName = isArray(permissionName) ? permissionName.map((permisssion) => { return appName + "_" + permisssion; }) : [appName + "_" + permissionName];
    if (!intersection(permissionName, permissions).length) {
        return res.status(403).json(sendValidationError());
    }
    next();
}

const sendValidationError = () => {
    return {
        message: 'User not Authorised'
    };
}


module.exports = {
    performPermissionValidation,
    performAppRoutePermissionValidation
}
