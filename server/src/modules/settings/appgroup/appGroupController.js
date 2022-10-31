const Promise = require('bluebird');
const { size, get, snakeCase, isEmpty, uniq, difference } = require('lodash');
const { AppGroup, AppUser, AppUserHistory } = require('@byjus-orders/nexemplum/ums')

const { BadRequestError } = require('../../../lib/errors');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");
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

        const list = await AppGroup.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}


/**
* Create App Groups`
*/
const createData = async (req, res) => {
    const { appGroupName, appName, description, appGroupUsers = [] } = req.body

    if (isEmpty(appGroupName) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")

    const appGroupDetails = await AppGroup.findOne({ appGroupName: snakeCase(appGroupName), appName }).lean();
    if (!isEmpty(appGroupDetails)) {
        let updatedResult = await updateAppGroupDetails(req, "active");
        res.json(updatedResult);
    }
    else {
        let orgFormattedName = get(req, 'user.orgFormattedName', '');
        let orgId = get(req, 'user.orgId', '');
        const newAppGroup = new AppGroup({
            ...req.body,
            appGroupName: snakeCase(appGroupName),
            status: "active",
            orgFormattedName,
            orgId,
            createdBy: req.user ? get(req.user, 'email') : 'system',
            updatedBy: '',
            actionDetails: {
                createdAt: new Date(),

                activatedAt: new Date()
            }
        })

        if (!isEmpty(appGroupUsers)) {
            await Promise.map(appGroupUsers, async (email) => {
                await AppUser.findOneAndUpdate({ email, appName }, {
                    "$addToSet": {
                        "groups": snakeCase(appGroupName)
                    }
                });
            });
        }

        const savedAppGroup = await newAppGroup.save()
        res.json(savedAppGroup)
    }
}

/**
 * Show the current App Groups
 */
const readData = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    const appGroupName = get(req, "params.appGroupName", "");
    const appGroup = await AppGroup.findOne({ appName, appGroupName: snakeCase(appGroupName) });
    res.json(appGroup)
}

/**
 * List all App Groups
 */
const listAll = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    const appGroups = await AppGroup.find({ appName, status: "active" });

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
    const { appGroupName, appName, description } = req.body;
    let { orgFormattedName } = req.user;
    if (isEmpty(appGroupName) || isEmpty(description)) throw new BadRequestError("Invalid Request : Required parameters missing")

    const oldData = await AppGroup.findOne({ appGroupName: snakeCase(appGroupName), appName }).lean();
    const formattedOldData = getFormattedAppGroupData(oldData);
    const formattedNewData = getFormattedAppGroupData(req.body);

    const historyLogs = getDiff(formattedOldData, formattedNewData, "appGroup");
    let { actionDetails = {}, createdAt } = oldData || {};

    /**if changes are there, then only update history */
    if (!isEmpty(historyLogs)) {
        await updateAppUserGroupField(formattedOldData, formattedNewData, appName, appGroupName, req.user, orgFormattedName);
        actionDetails = setActionDetails(actionDetails, formattedOldData, formattedNewData);
        await updateAppGroupHistory(req, formattedNewData, actionDetails, historyLogs, orgFormattedName);
    }

    return { ...formattedNewData, historyLogs, message: "Updated Successfully" }
}

const updateAppUserGroupField = async (formattedOldData, formattedNewData, appName, appGroupName, user, orgFormattedName) => {
    let oldAppGroupUsers = get(formattedOldData, 'appGroupUsers', []);
    let newAppGroupUsers = get(formattedNewData, 'appGroupUsers', [])

    let removedGroupUsers = oldAppGroupUsers.filter(x => !newAppGroupUsers.includes(x));
    if (!isEmpty(removedGroupUsers)) {
        await Promise.map(removedGroupUsers, async (email) => {
            const appUserDetails = await AppUser.findOne({ "email": email, appName, orgFormattedName });
            const { appRoleName, orgId, createdAt, createdBy } = appUserDetails;
            let groups = [];
            let newGroups = [];
            groups = get(appUserDetails, 'groups', []);
            newGroups = groups.filter(x => x !== snakeCase(appGroupName));
            await AppUser.findOneAndUpdate({ email, appName, orgFormattedName }, {
                "$pull": {
                    "groups": snakeCase(appGroupName)
                },
                updatedBy: user ? get(user, 'email') : 'system',
                updatedAt: new Date()
            });
            await AppUserHistory.create({
                email,
                appRoleName: appRoleName,
                appName,
                orgId,
                orgFormattedName,
                changes: {
                    entityName: "groups",
                    oldValue: groups.join(", "),
                    newValue: newGroups.join(", ")
                },
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
            const appUserDetails = await AppUser.findOne({ "email": email, appName, orgFormattedName });
            const { appRoleName, orgId, createdAt, createdBy } = appUserDetails;
            let groups = [];
            let newGroups = [];
            groups = get(appUserDetails, 'groups', []);
            newGroups = [...groups, snakeCase(appGroupName)];

            await AppUser.findOneAndUpdate({ email, appName, orgFormattedName }, {
                "$addToSet": {
                    "groups": snakeCase(appGroupName)
                },
                updatedBy: user ? get(user, 'email') : 'system',
                updatedAt: new Date()
            });
            await AppUserHistory.create({
                email,
                appRoleName: appRoleName,
                appName,
                orgId,
                orgFormattedName,
                changes: {
                    entityName: "groups",
                    oldValue: groups.join(", "),
                    newValue: newGroups.join(", ")
                },
                createdAt: new Date(),
                createdBy: user ? get(user, 'email') : 'system',
                updatedAt: new Date(),
                updatedBy: user ? get(user, 'email') : 'system'
            });
        });
    }
}

const updateAppGroupHistory = async (req, formattedNewData, actionDetails, historyLogs, orgFormattedName) => {
    const { appGroupName, appName } = req.body;
    await AppGroup.updateOne({ appGroupName: snakeCase(appGroupName), appName, orgFormattedName }, {
        $set: {
            ...formattedNewData,
            updatedBy: req.user ? get(req.user, 'email') : 'system',
            actionDetails
        },
        $push: {
            history: {
                changes: historyLogs,
                updatedBy: req.user ? get(req.user, 'email') : 'system',
                updatedAt: new Date()
            }
        },
    })
}

const getFormattedAppGroupData = (data) => {
    let formattedData = {
        appGroupName: snakeCase(get(data, 'appGroupName', '')),
        description: get(data, 'description', ''),
        appGroupUsers: get(data, 'appGroupUsers', []),
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
    const { emails = [], appGroupName, appName } = req.body;

    if (!emails || !appGroupName || !appName) throw new BadRequestError('appGroupName, appName or Emails array is missing');

    if (emails.length) {
        await updateAppGroups(emails, appGroupName, appName, "assign", req.user);
    }

    res.json("Assigned Application Groups");
}

/**UnAssign Application Groups from a set of Employees */
const unassignAppGroups = async (req, res) => {
    const { emails = [], appGroupName, appName } = req.body;

    if (!emails || !appGroupName || !appName) throw new BadRequestError('appGroupName or Emails array is missing');

    if (emails.length) {
        await updateAppGroups(emails, appGroupName, appName, "unassign", req.user);
    }

    res.json("Un-Assigned Application Groups");
}

const updateAppGroups = async (emails, appGroupName, appName, type, user) => {
    let orgFormattedName = get(user, "orgFormattedName", "");
    const appGroupDetails = await AppGroup.findOne({ appGroupName: snakeCase(appGroupName), appName, orgFormattedName }).lean();

    const uniqEmailIdArray = uniq(emails);
    try {
        await Promise.map(uniqEmailIdArray, async (email) => {
            email = email.trim().toLowerCase();
            const appUserDetails = await AppUser.findOne({ "email": email, appName, orgFormattedName });

            if (appUserDetails) {
                let queryParams = { type, appUserDetails, appGroupDetails, appGroupName, email, user }
                let { appUserUpdateQuery = {}, appGroupUpdateQuery = {} } = fetchUpdateQueries(queryParams);

                await AppUser.findOneAndUpdate({ "email": email, appName, orgFormattedName }, appUserUpdateQuery);
                await AppGroup.updateOne({ "appGroupName": appGroupName, appName, orgFormattedName }, appGroupUpdateQuery);
            }
            return;
        }, {
            concurrency: 10
        });

        return;
    } catch (error) {
        throw new Error(error);
    }
}

const fetchUpdateQueries = (queryParams) => {
    let { type, appUserDetails, appGroupDetails, appGroupName, email, user } = queryParams;

    let userActionDetails = get(appUserDetails, "actionDetails", []);
    let groupActionDetails = get(appGroupDetails, "actionDetails", []);
    userActionDetails["updatedAt"] = new Date();
    groupActionDetails["updatedAt"] = new Date();

    let groups = get(appUserDetails, "groups", []);
    let newGroups = [];

    let appGroupUsers = get(appGroupDetails, "appGroupUsers", []);
    let newAppGroupUsers = [];

    let appUserUpdateQuery = {};
    let appGroupUpdateQuery = {};

    /**Add Groups & Users */
    if (type === "assign") {

        newGroups.push(...groups, appGroupName);
        newAppGroupUsers.push(...appGroupUsers, email);

        appUserUpdateQuery = {
            "$addToSet": {
                "groups": appGroupName
            },
            "$set": {
                updatedBy: user ? get(user, 'email') : 'system',
                actionDetails: userActionDetails
            },
            "$push": {
                history: {
                    changes: {
                        groups: {
                            oldValue: groups,
                            newValue: newGroups
                        }
                    },
                    updatedBy: user ? get(user, 'email') : 'system',
                    updatedAt: new Date()
                }
            }
        }

        appGroupUpdateQuery = {
            "$addToSet": {
                "appGroupUsers": email
            },
            "$set": {
                updatedBy: user ? get(user, 'email') : 'system',
                actionDetails: groupActionDetails
            },
            "$push": {
                history: {
                    changes: {
                        appGroupName: {
                            oldValue: appGroupUsers,
                            newValue: newAppGroupUsers
                        }
                    },
                    updatedBy: user ? get(user, 'email') : 'system',
                    updatedAt: new Date()
                }
            }
        }
    }

    /**Remove Groups & Users */
    if (type === "unassign") {

        newGroups = groups.filter(x => x != appGroupName);
        newAppGroupUsers = appGroupUsers.filter(x => x != email);

        appUserUpdateQuery = {
            "$pull": {
                "groups": appGroupName
            },
            "$set": {
                updatedBy: user ? get(user, 'email') : 'system',
                actionDetails: userActionDetails
            },
            "$push": {
                history: {
                    changes: {
                        groups: {
                            oldValue: groups,
                            newValue: newGroups
                        }
                    },
                    updatedBy: user ? get(user, 'email') : 'system',
                    updatedAt: new Date()
                }
            }
        }

        appGroupUpdateQuery = {
            "$pull": {
                "appGroupUsers": email
            },
            "$set": {
                updatedBy: user ? get(user, 'email') : 'system',
                actionDetails: groupActionDetails
            },
            "$push": {
                history: {
                    changes: {
                        appGroupName: {
                            oldValue: appGroupUsers,
                            newValue: newAppGroupUsers
                        }
                    },
                    updatedBy: user ? get(user, 'email') : 'system',
                    updatedAt: new Date()
                }
            }
        }
    }

    return { appUserUpdateQuery, appGroupUpdateQuery };
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
