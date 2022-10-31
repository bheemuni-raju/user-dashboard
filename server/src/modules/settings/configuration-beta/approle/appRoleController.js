const Promise = require('bluebird');
const { extend, size, get, snakeCase, isEmpty, first } = require('lodash');
const { AppRole, AppUser, AppRoleHistory } = require('@byjus-orders/npgexemplum')
const { NotFoundError, BadRequestError } = require('../../../../lib/errors');
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const commonController = require("../../../../common/dataController");
const { updateAppUserDetails } = require("../../appuser/appUserController");
const { getDiff } = require("../../hierarchy/utils/hierarchyUtil");

const { getOrgId, getAppId } = require('../../hierarchy-beta/utils/hierarchyUtil');

const listData = async (req, res) => {
    let { page, limit, sort, searchCriterias = [], contextCriterias = [] } = req.body;
    let { filter } = req.body;

    filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    const sqlOrder = Object.keys(sort).map(item => {
        return [item, sort[item]];
    });
    try {
        const options = {
            page: page || 1,
            paginate: limit || 10,
            where: filter,
            order: sqlOrder
        }
        const list = await AppRole.paginate(options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}
const listAll = async (req, res) => {
    const appRoles = await AppRole.find({ status: "active" });

    res.send(appRoles);
}
/**
* Create App Role`
*/
const createData = async (req, res) => {
    const { name, formattedName, description } = req.body
    if (isEmpty(name) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")

    let orgName = get(req, "user.orgFormattedName", "");
    let orgId = await getOrgId(orgName);
    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)

    const appRoleDetails = await AppRole.findOne({ where: { formattedName: snakeCase(name), appId, orgId } });
    if (!isEmpty(appRoleDetails)) {
        let updatedResult = await updateAppRoleDetails(req, "active");
        res.json(updatedResult);
    }
    else {
        const newAppRole = new AppRole({
            ...req.body,
            name,
            formattedName: snakeCase(name),
            status: "active",
            orgId,
            createdBy: req.user ? get(req.user, 'email') : 'system',
            createdAt: new Date()
        })

        const savedAppRole = await newAppRole.save()
        res.json(savedAppRole)
    }
}

/**
 * Show the current App Role
 */
const readData = async (req, res) => {
    let orgName = get(req, "user.orgFormattedName", "");
    let orgId = await getOrgId(orgName);
    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)
    const formattedName = get(req, "params.formattedName", "");
    const appRole = await AppRole.findOne({ where: { appId, orgId, formattedName } });
    res.json(appRole)
}

/**
 * Update an App Role
*/
const updateData = async (req, res) => {
    let updatedResult = await updateAppRoleDetails(req, "active");
    res.json(updatedResult);
}

const updateAppRoleDetails = async (req, status) => {
    const { id, permissions, description, onToggle } = req.body;
    const { formattedName } = req.params

    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)

    let orgFormattedName = get(req, 'user.orgFormattedName', '');
    let orgId = get(req, 'user.orgId', '');

    const oldData = await AppRole.find({ where: { formattedName, appId, orgId } });
    const appRoleName = get(oldData, "name", "")
    if (!onToggle) {
        if (isEmpty(appRoleName) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")
    }
    const formattedOldData = getFormattedAppRoleData(oldData);
    const formattedNewData = {
        ...formattedOldData,
        ...getFormattedAppRoleData(req.body),
        status: !isEmpty(status) ? status : get(formattedOldData, "status", ""),
        name: !isEmpty(appRoleName) ? appRoleName : get(formattedOldData, "name", ""),
        formattedName: !isEmpty(snakeCase(formattedName)) ? snakeCase(formattedName) : get(formattedOldData, "formattedName", ""),
    }
    const appRoleDetails = await AppRole.findOne({ where: { formattedName, appId } });
    const historyLogs = getDiff(formattedOldData, formattedNewData, "appRole");
    let { actionDetails = {}, createdAt } = oldData || {};

    /**if changes are there, then only update history */
    if (!isEmpty(historyLogs)) {
        if (status === "inactive") {
            await updateAppRoleUsers(req, status);
        }

        await AppRole.update({ where: { formattedName, appId, orgId } }, {
            ...formattedNewData,
            updatedBy: req.user ? get(req.user, 'email') : 'system',
            actionDetails,
            updatedAt: new Date()
        }, {
            where: {
                id
            }
        })

        if (!isEmpty(appRoleDetails)) {
            if (appRoleDetails.description != description) {
                await AppRoleHistory.create({
                    appId,
                    name: appRoleName,
                    formattedName: snakeCase(appRoleName),
                    orgId,
                    attribute: "description",
                    oldValue: get(formattedOldData, "description", ""),
                    newValue: get(formattedNewData, "description", ""),
                    createdAt: new Date(),
                    createdBy: req.user ? get(req.user, 'email') : 'system',
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date()
                }, {
                    where: {
                        id
                    }
                });
            }

            if (appRoleDetails.status != status) {
                await AppRoleHistory.create({
                    appId,
                    name: appRoleName,
                    formattedName: snakeCase(appRoleName),
                    orgId,
                    entityName: "status",
                    oldValue: get(formattedOldData, "status", ''),
                    newValue: get(formattedNewData, "status", ''),
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
    const { formattedName, appRoleUsers } = req.body;

    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)

    let orgFormattedName = get(req, 'user.orgFormattedName', '');
    let orgId = await getOrgId(orgFormattedName)

    if (appRoleUsers && appRoleUsers.length > 0) {
        await Promise.map(appRoleUsers, async (user) => {
            let updatedReq = {
                body: {
                    email: user.email,
                    appId,
                    name: snakeCase(formattedName),
                    skill: user.skill,
                    orgId
                },
                user: req.user,
            }

            await updateAppUserDetails(updatedReq, status);
        });
    }
}

const getFormattedAppRoleData = (data) => {
    let formattedData = {
        appId: get(data, 'appId', ''),
        name: get(data, 'name', ''),
        formattedName: get(data, 'formattedName', ''),
        description: get(data, 'description', ''),
        status: get(data, 'status', '')
    }

    return formattedData;
}

/** Delete an App Role*/
const deleteData = async (req, res) => {
    const id = req.role.id
    logger.info({ method: 'deleteData' }, 'Delete a role', id)
    await AppRole.update({
        status: "inactive",
        updatedAt: new Date(),
        updatedBy: req.user ? get(req.user, 'email') : 'system',
        deletedAt: new Date()
    }, {
        where: {
            id
        }
    });
    await AppRole.destroy({ where: { id } });
    res.json(req.appRole)
}

const updateRoleName = async (req, res) => {
    const { id, oldRoleName, newRoleName, updatedBy } = req.body;
    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)

    let orgFormattedName = get(req, 'user.orgFormattedName', '');
    let orgId = await getOrgId(orgFormattedName)
    let appRoleDetails = await AppRole.findOne({ formattedName: snakeCase(oldRoleName), appName, orgFormattedName });
    let { actionDetails = {} } = appRoleDetails;
    actionDetails["updatedAt"] = new Date();

    try {

        await AppRole.findOneAndUpdate({ formattedName: snakeCase(oldRoleName), appName, orgFormattedName }, {
            name: newRoleName,
            formattedName: snakeCase(newRoleName),
            updatedBy: req.user ? get(req.user, 'email') : 'system',
            updatedAt: new Date(),
            actionDetails
        }, {
            where: {
                id
            }
        });
        if (oldRoleName != newRoleName) {
            await AppRoleHistory.create({
                appId,
                orgId,
                appRoleId: id,
                attribute: "name",
                oldValue: snakeCase(oldRoleName),
                newValue: snakeCase(newRoleName),
                createdAt: new Date(),
                createdBy: req.user ? get(req.user, 'email') : 'system',
                updatedBy: req.user ? get(req.user, 'email') : 'system',
                updatedAt: new Date()
            });
        }
        await AppUser.update({ name: snakeCase(oldRoleName), appId }, {
            "appRoleName": snakeCase(newRoleName)
        }, {
            where: {
                id
            }
        });

        return res.json({ message: `Role Name updated successfully for ${snakeCase(oldRoleName)}`, data: snakeCase(newRoleName) });
    } catch (error) {
        throw new Error(error);
    }
}

const appRoleById = async (req, res, next, id) => {
    const AppRole = await AppRole.findOne({ where: { id } });
    if (!AppRole) throw new NotFoundError
    req.AppRole = AppRole
    next()
}

module.exports = {
    ...commonController,
    listData,
    listAll,
    createData,
    readData,
    updateData,
    deleteData,
    updateRoleName,
    appRoleById
}