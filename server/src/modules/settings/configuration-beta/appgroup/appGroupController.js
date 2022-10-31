const Promise = require('bluebird');
const { size, get, snakeCase, isEmpty } = require('lodash');
const { AppGroup, AppUser, AppGroupHistory } = require('@byjus-orders/npgexemplum')
const { NotFoundError, BadRequestError } = require('../../../../lib/errors');
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const commonController = require("../../../../common/dataController");
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
        const list = await AppGroup.paginate(options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

/**
* Create App Groups`
*/
const createData = async (req, res) => {
    const { name, description, appGroupUsers = [] } = req.body
    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)

    let orgFormattedName = get(req, 'user.orgFormattedName', '');
    let orgId = await getOrgId(orgFormattedName)
    if (isEmpty(name) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")

    const appGroupDetails = await AppGroup.findOne({ name: snakeCase(name), appId }).lean();
    if (!isEmpty(appGroupDetails)) {
        let updatedResult = await updateAppGroupDetails(req, "active");
        res.json(updatedResult);
    }
    else {
        const newAppGroup = new AppGroup({
            ...req.body,
            name: snakeCase(name),
            status: "active",
            orgId,
            appId,
            createdBy: req.user ? get(req.user, 'email') : 'system',
            createdAt: new Date()
        })
        const savedAppGroup = await newAppGroup.save()
        res.json(savedAppGroup)
    }
}

/**
 * Show the current App Groups
 */
const readData = async (req, res) => {
    let orgName = get(req, "user.orgFormattedName", "");
    let orgId = await getOrgId(orgName);
    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)
    const formattedName = get(req, "params.formattedName", "");
    const appGroup = await AppGroup.findOne({ where: { appId, orgId, formattedName } });
    res.json(appGroup)
}

/**
 * List all App Groups
 */
const listAll = async (req, res) => {
    let appName = get(req, "user.appName", "");
    let appId = await getAppId(appName)
    const appGroups = await AppGroup.find({ where: { appId, status: "active" } });

    res.json(appGroups)
}

/**
 * Update an App Group
 */
const updateData = async (req, res) => {
    let updatedResult = await updateAppGroupDetails(req, "active");
    res.json(updatedResult);
}

const updateAppGroupDetails = async (req, status) => {
    const { name, appId, description } = req.body;
    let { orgFormattedName } = req.user;
    if (isEmpty(name) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")

    const oldData = await AppGroup.findOne({ name: snakeCase(name), appId }).lean();
    const formattedOldData = getFormattedAppGroupData(oldData);
    const formattedNewData = getFormattedAppGroupData(req.body);

    const historyLogs = getDiff(formattedOldData, formattedNewData, "appGroup");
    let { actionDetails = {}, createdAt } = oldData || {};

    /**if changes are there, then only update history */
    if (!isEmpty(historyLogs)) {
        await updateAppUserGroupField(formattedOldData, formattedNewData, appId, name, req.user, orgFormattedName);
        actionDetails = setActionDetails(actionDetails, formattedOldData, formattedNewData);
        await updateAppGroupHistory(req, formattedNewData, actionDetails, historyLogs, orgFormattedName);
    }

    return { ...formattedNewData, historyLogs, message: "Updated Successfully" }
}

const updateAppUserGroupField = async (formattedOldData, formattedNewData, appId, name, user, orgFormattedName) => {
    let oldAppGroupUsers = get(formattedOldData, 'appGroupUsers', []);
    let newAppGroupUsers = get(formattedNewData, 'appGroupUsers', [])

    let removedGroupUsers = oldAppGroupUsers.filter(x => !newAppGroupUsers.includes(x));
    if (!isEmpty(removedGroupUsers)) {
        await Promise.map(removedGroupUsers, async (email) => {
            const appUserDetails = await AppUser.findOne({ "email": email, appId, orgFormattedName });
            const { appRoleName, orgId, createdAt, createdBy } = appUserDetails;
            let groups = [];
            let newGroups = [];
            groups = get(appUserDetails, 'groups', []);
            newGroups = groups.filter(x => x !== snakeCase(name));
            await AppUser.findOneAndUpdate({ email, appId, orgFormattedName }, {
                "$pull": {
                    "groups": snakeCase(name)
                },
                updatedBy: user ? get(user, 'email') : 'system',
                updatedAt: new Date()
            });
            await AppUserHistory.create({
                email,
                appRoleName: appRoleName,
                appId,
                orgId,
                entityName: "groups",
                oldValue: groups.join(", "),
                newValue: newGroups.join(", "),
                createdAt: new Date(),
                createdBy: user ? get(user, 'email') : 'system',
                updatedAt: new Date(),
                updatedBy: user ? get(user, 'email') : 'system'
            });
        });
    }
    let addedGroupUsers = newAppGroupUsers.filter(x => !oldAppGroupUsers.includes(x));
    if (!isEmpty(addedGroupUsers)) {
        await Promise.map(addedGroupUsers, async (email) => {
            const appUserDetails = await AppUser.findOne({ "email": email, appId, orgFormattedName });
            const { appRoleName, orgId, createdAt, createdBy } = appUserDetails;
            let groups = [];
            let newGroups = [];
            groups = get(appUserDetails, 'groups', []);
            newGroups = [...groups, snakeCase(name)];

            await AppUser.findOneAndUpdate({ email, appId, orgFormattedName }, {
                "$addToSet": {
                    "groups": snakeCase(name)
                },
                updatedBy: user ? get(user, 'email') : 'system',
                updatedAt: new Date()
            });
            await AppUserHistory.create({
                email,
                appRoleName: appRoleName,
                appId,
                orgId,
                attribute: "groups",
                oldValue: groups.join(", "),
                newValue: newGroups.join(", "),
                createdAt: new Date(),
                createdBy: user ? get(user, 'email') : 'system',
                updatedAt: new Date(),
                updatedBy: user ? get(user, 'email') : 'system'
            });
        });
    }
}

const updateAppGroupHistory = async (req, formattedNewData, actionDetails, historyLogs, orgFormattedName) => {
    const { name, appId } = req.body;
    await AppGroup.updateOne({ name: snakeCase(name), appId, orgFormattedName }, {
        ...formattedNewData,
        updatedBy: req.user ? get(req.user, 'email') : 'system',
        actionDetails
    })
}

const getFormattedAppGroupData = (data) => {
    let formattedData = {
        name: snakeCase(get(data, 'name', '')),
        description: get(data, 'description', ''),
        appGroupUsers: get(data, 'appGroupUsers',''),
        status: get(data, 'status', '')
    }

    return formattedData;
}

/** Delete an App Group*/
const deleteData = async (req, res) => {
    let updatedData = await updateAppGroupDetails(req, "inactive");
    res.json(updatedData);
}

/**Assign Application Groups to a set of Employees */
const assignAppGroups = async (req, res) => {
    const { emails, name, appId } = req.body;

    if (!emails || !name || !appId) throw new BadRequestError('name, appId or Emails are missing');

    if (emails.length) {
        await updateAppGroups(emails, name, appId, "assign", req.user);
    }

    res.json("Assigned Application Groups");
}

/**UnAssign Application Groups from a set of Employees */
const unassignAppGroups = async (req, res) => {
    const { emails = [], name, appId } = req.body;

    if (!emails || !name || !appId) throw new BadRequestError('name or Emails are missing');

    if (emails.length) {
        await updateAppGroups(emails, name, appId, "unassign", req.user);
    }

    res.json("Un-Assigned Application Groups");
}


module.exports = {
    ...commonController,
    listData,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    assignAppGroups,
    unassignAppGroups
}
