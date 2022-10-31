const Promise = require('bluebird');
const { extend, size, get, snakeCase, isEmpty } = require('lodash');
const { AppRole, AppUser, AppRoleHistory } = require('@byjus-orders/nexemplum/ums')

const {
    NotFoundError, BadRequestError
} = require('../../../lib/errors');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");
const { updateAppUserDetails } = require("../appuser/appUserController");
const { getDiff, setActionDetails } = require("../../core/utils/userUtil");

const listData = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    filter["appName"] = appName;
    filter["orgFormattedName"] = get(req, 'user.orgFormattedName', 'byjus');

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await AppRole.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}


/**
* Create App Role`
*/
const createData = async (req, res) => {
    let { appRoleName, appRoleFormattedName, appName, description, orgFormattedName, orgId } = req.body
    if (isEmpty(appRoleName) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")

    const appRoleDetails = await AppRole.findOne({ appRoleFormattedName: snakeCase(appRoleName), appName, orgFormattedName }).lean();
    if (!isEmpty(appRoleDetails)) {
        let updatedResult = await updateAppRoleDetails(req, "active");
        res.json(updatedResult);
    }
    else {
        orgFormattedName = orgFormattedName ? orgFormattedName : get(req, 'user.orgFormattedName', '');
        orgId = orgId ? orgId : get(req, 'user.orgId', '');
        const newAppRole = new AppRole({
            ...req.body,
            appRoleName,
            appRoleFormattedName: snakeCase(appRoleName),
            status: "active",
            orgFormattedName,
            orgId,
            createdBy: req.user ? get(req.user, 'email') : 'system',
            actionDetails: {
                createdAt: new Date(),
                activatedAt: new Date()
            }
        })

        const savedAppRole = await newAppRole.save()
        res.json(savedAppRole)
    }
}

/**
 * Show the current App Role
 */
const readData = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    const appRoleFormattedName = get(req, "params.appRoleFormattedName", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');
    const appRole = await AppRole.findOne({ appName, orgFormattedName, appRoleFormattedName });
    res.json(appRole)
}

/**
 * List all App Roles
 */
const listAll = async (req, res) => {
    console.log("listAll Invoke ")
    let appName = get(req, "headers.x-app-origin", "");
    const appRoles = await AppRole.find({ appName, status: "active" });
    console.log("appRoles : ", appRoles)
    res.send(appRoles);
}

/**
 * Update an App Role
 */
const updateData = async (req, res) => {
    let updatedResult = await updateAppRoleDetails(req, "active");
    res.json(updatedResult);
}

const updateAppRoleDetails = async (req, status) => {
    const { appName, permissions, description, onToggle } = req.body;
    const { appRoleFormattedName } = req.params

    let orgFormattedName = get(req, 'user.orgFormattedName', '');
    let orgId = get(req, 'user.orgId', '');

    const oldData = await AppRole.findOne({ appRoleFormattedName, appName, orgFormattedName }).lean();
    const appRoleName = get(oldData, "appRoleName", "")
    if (!onToggle) {
        if (isEmpty(appRoleName) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")
    }
    const formattedOldData = getFormattedAppRoleData(oldData);
    const formattedNewData = {
        ...formattedOldData,
        ...getFormattedAppRoleData(req.body),
        status: !isEmpty(status) ? status : get(formattedOldData, "status", ""),
        permissions: !isEmpty(permissions) ? permissions : get(formattedOldData, "permissions", []),
        appRoleName: !isEmpty(appRoleName) ? appRoleName : get(formattedOldData, "appRoleName", ""),
        appRoleFormattedName: !isEmpty(snakeCase(appRoleFormattedName)) ? snakeCase(appRoleFormattedName) : get(formattedOldData, "appRoleFormattedName", ""),
    }

    const appRoleDetails = await AppRole.findOne({ appRoleFormattedName, appName });
    const historyLogs = getDiff(formattedOldData, formattedNewData, "appRole");
    let { actionDetails = {}, createdAt } = oldData || {};

    /**if changes are there, then only update history */
    if (!isEmpty(historyLogs)) {

        actionDetails = setActionDetails(actionDetails, formattedOldData, formattedNewData);

        if (status === "inactive") {
            await updateAppRoleUsers(req, status);
        }

        await AppRole.updateOne({ appRoleFormattedName, appName, orgFormattedName }, {
            $set: {
                ...formattedNewData,
                updatedBy: req.user ? get(req.user, 'email') : 'system',
                actionDetails,
                updatedAt: new Date()
            }
        })
        const oldPermissionData = get(formattedOldData, "permissions", []).join(', ');
        const newPermissionData = get(formattedNewData, "permissions", []).join(', ')

        if (!isEmpty(appRoleDetails)) {
            if (appRoleDetails.description != description) {
                await AppRoleHistory.create({
                    appName,
                    appRoleName,
                    appRoleFormattedName: snakeCase(appRoleName),
                    orgId,
                    orgFormattedName,
                    changes: {
                        entityName: "description",
                        oldValue: get(formattedOldData, "description", ""),
                        newValue: get(formattedNewData, "description", "")
                    },
                    createdAt: new Date(),
                    createdBy: req.user ? get(req.user, 'email') : 'system',
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date()
                });
            }

            if (appRoleDetails.status != status) {
                await AppRoleHistory.create({
                    appName,
                    appRoleName,
                    appRoleFormattedName: snakeCase(appRoleName),
                    orgId,
                    orgFormattedName,
                    changes: {
                        entityName: "status",
                        oldValue: get(formattedOldData, "status", ''),
                        newValue: get(formattedNewData, "status", '')
                    },
                    createdAt: new Date(),
                    createdBy: req.user ? get(req.user, 'email') : 'system',
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date()

                });
            }
            if (oldPermissionData !== newPermissionData) {
                await AppRoleHistory.create({
                    appName,
                    appRoleName,
                    appRoleFormattedName: snakeCase(appRoleName),
                    orgId,
                    orgFormattedName,
                    changes: {
                        entityName: "permissions",
                        oldValue: oldPermissionData,
                        newValue: newPermissionData
                    },
                    createdAt: new Date(),
                    createdBy: req.user ? get(req.user, 'email') : 'system',
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date()
                });
            }
        }
        if (status === "active") {
            await updateAppRoleUsers(req, status);
        }
    }

    return { ...formattedNewData, historyLogs, message: "Updated Successfully" }
}

const updateAppRoleUsers = async (req, status) => {
    const { appRoleFormattedName, appName, appRoleUsers } = req.body;
    if (appRoleUsers && appRoleUsers.length > 0) {
        await Promise.map(appRoleUsers, async (user) => {
            let updatedReq = {
                body: {
                    email: user.email,
                    appName,
                    appRoleName: snakeCase(appRoleFormattedName),
                    skill: user.skill,
                    orgFormattedName: get(req, "user.orgFormattedName", ""),
                    orgId: get(req, "user.orgId", "")
                },
                user: req.user
            }

            await updateAppUserDetails(updatedReq, status);
        });
    }
}

const getFormattedAppRoleData = (data) => {
    let formattedData = {
        appName: snakeCase(get(data, 'appName', '')),
        appRoleName: get(data, 'appRoleName', ''),
        appRoleFormattedName: get(data, 'appRoleFormattedName', ''),
        description: get(data, 'description', ''),
        permissions: get(data, 'permissions', []),
        status: get(data, 'status', '')
    }

    return formattedData;
}

/** Delete an App Role*/
const deleteData = async (req, res) => {
    let updatedData = await updateAppRoleDetails(req, "inactive");
    res.json(updatedData);
}

const updateRoleName = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    const { oldRoleName, newRoleName, updatedBy } = req.body;
    let orgFormattedName = get(req, "user.orgFormattedName", "");

    let appRoleDetails = await AppRole.findOne({ appRoleFormattedName: snakeCase(oldRoleName), appName, orgFormattedName });
    let { actionDetails = {} } = appRoleDetails;
    actionDetails["updatedAt"] = new Date();

    try {

        await AppRole.findOneAndUpdate({ appRoleFormattedName: snakeCase(oldRoleName), appName, orgFormattedName }, {
            "$set": {
                "appRoleName": newRoleName,
                "appRoleFormattedName": snakeCase(newRoleName),
                updatedBy: req.user ? get(req.user, 'email') : 'system',
                updatedAt: new Date(),
                actionDetails
            }
        });
        if (oldRoleName != newRoleName) {
            await AppRoleHistory.create({
                appName,
                appRoleName: newRoleName,
                appRoleFormattedName: snakeCase(newRoleName),
                orgId: get(appRoleDetails, "orgId", ""),
                orgFormattedName: get(appRoleDetails, "orgFormattedName", ""),
                changes: {
                    entityName: "appRoleName",
                    oldValue: snakeCase(oldRoleName),
                    newValue: snakeCase(newRoleName)
                },
                createdAt: new Date(),
                createdBy: req.user ? get(req.user, 'email') : 'system',
                updatedBy: req.user ? get(req.user, 'email') : 'system',
                updatedAt: new Date()
            })
        }
        await AppUser.updateMany({ appRoleName: snakeCase(oldRoleName), appName }, {
            "$set": {
                "appRoleName": snakeCase(newRoleName)
            }
        });

        return res.json({ message: `Role Name updated successfully for ${snakeCase(oldRoleName)}`, data: snakeCase(newRoleName) });
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    ...commonController,
    listData,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    updateRoleName
}