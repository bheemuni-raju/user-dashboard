const Promise = require('bluebird');
const { extend, size, get, isEmpty, isArray, uniq, snakeCase } = require('lodash');
const { AppUser, AppRole, AppUserHistory } = require('@byjus-orders/nexemplum/ums')

const {
    NotFoundError, BadRequestError
} = require('../../../lib/errors');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController")
const { getDiff, setActionDetails } = require("../../core/utils/userUtil");
const appUserHelper = require('@byjus-orders/nfoundation/ums/user/appUserHelper');
const { validateEmailFormat } = require('@byjus-orders/nfoundation/ums/utils/userUtil');
const userCache = require('../../core/user/userCache');
const bunyan = require('../../../lib/bunyan-logger');
const logger = bunyan('appUserController');

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

        const list = await AppUser.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}


/**
* Create App User`
*/
const createData = async (req, res) => {
    const { email, appRoleName, appName, groups = [] } = req.body
    let orgFormattedName = get(req, 'user.orgFormattedName', '');
    let orgId = get(req, 'user.orgId', '');

    if (!email && !appRoleName) throw new BadRequestError("Invalid Request : Required parameters missing");

    let validEmail = validateEmailFormat(email);
    if (!validEmail) throw new BadRequestError("Invalid Email Format");

    const appUserDetails = await AppUser.findOne({ email: email.toLowerCase(), appName, orgFormattedName });
    if (!isEmpty(appUserDetails)) {
        let updatedResult = await updateAppUserDetails(req, "active");
        res.json(updatedResult);
    }
    else {

        let appUserOrgDetails = await AppUser.findOne({ email: email.toLowerCase(), appName, orgFormattedName: { "$nin": [orgFormattedName] } });
        let userOrganizations = [];
        if (!isEmpty(appUserOrgDetails)) {
            userOrganizations = [...get(appUserOrgDetails, "userOrganizations", []), {
                orgFormattedName,
                orgId,
                appRoleName
            }];

            await AppUser.updateMany({
                email: email.toLowerCase(),
                appName,
                orgFormattedName: { "$nin": [orgFormattedName] }
            }, {
                userOrganizations
            })
        }
        else {
            userOrganizations = [{
                orgFormattedName,
                orgId,
                appRoleName
            }];
        }

        const newAppUser = new AppUser({
            ...req.body,
            email: email.toLowerCase(),
            status: "active",
            appRoleName: snakeCase(appRoleName),
            orgFormattedName,
            orgId,
            isDefaultOrg: (orgFormattedName === "byjus") ? true : false,
            userOrganizations,
            createdBy: req.user ? get(req.user, 'email') : 'system',
            updatedBy: '',
            groups: groups,
            actionDetails: {
                createdAt: new Date(),
                activatedAt: new Date()
            }
        })

        const savedAppUser = await newAppUser.save();
        res.json(savedAppUser)
    }
}

/**
 * Show the current App User
 */
const readData = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    const email = get(req, "params.appUserEmail", "");
    const appUser = await AppRole.findOne({ appName, email: email.toLowerCase(), status: "active" });
    res.json(appUser)
}

/**
 * List all App Users
 */
const listAll = async (req, res) => {
    try {
        let appName = get(req, "headers.x-app-origin", "");
        let orgFormattedName = get(req, "user.orgFormattedName", "");
        const appUsers = await AppUser.find({ appName, orgFormattedName });
        res.send(appUsers);
    } catch (error) {
        logger.error({ method: 'listAll' }, `Error: ${error.message}`);
    }
}

/**
 * Update an App User
 */
const updateData = async (req, res) => {
    const { appRoleName, appName, orgFormattedName } = req.body;
    const appRoleDetails = await AppRole.findOne({ appRoleFormattedName: snakeCase(appRoleName), appName, status: "active", orgFormattedName });
    if (!isEmpty(appRoleDetails)) {
        let updatedResult = await updateAppUserDetails(req, "active");
        res.json(updatedResult);
    }
    else {
        throw new BadRequestError("Update Failed: Please select an active role");
    }
}

const updateAppUserDetails = async (req, status) => {
    const { email, appName, appRoleName, skill, orgFormattedName, orgId, createdBy } = req.body
    const oldData = await AppUser.findOne({ email: email.toLowerCase(), appName, orgFormattedName });
    const formattedOldData = getFormattedAppUserData(oldData);
    const formattedNewData = {
        ...formattedOldData,
        ...getFormattedAppUserData(req.body),
        status: !isEmpty(status) ? status : get(formattedOldData, "status", ""),
        skill: !isEmpty(skill) ? skill : get(formattedOldData, "skill", ""),
        appRoleName: !isEmpty(appRoleName) ? snakeCase(appRoleName) : snakeCase(get(formattedOldData, "appRoleName", "")),
        orgFormattedName,
        orgId
    }

    const historyLogs = getDiff(formattedOldData, formattedNewData, "appUser");

    let appUserDetails = await AppUser.findOne({ email: email.toLowerCase(), appName, orgFormattedName });
    let { actionDetails = {}, createdAt, userOrganizations = [] } = appUserDetails || {};

    let isDuplicateOrg = false;
    userOrganizations.map(data => {
        if (data.orgFormattedName === get(req, 'user.orgFormattedName', '')) {
            isDuplicateOrg = true;
            data["appRoleName"] = snakeCase(appRoleName);
        }
    })
    /**if changes are there, then only update history */
    if (!isEmpty(oldData) && !isEmpty(historyLogs)) {
        let setConditions = {};
        let userOrgSetCondition = {};
        if (!isDuplicateOrg) {
            setConditions = {
                $set: {
                    ...formattedNewData,
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    actionDetails
                }
            }

            userOrgSetCondition = {
                $addToSet: {
                    userOrganizations: {
                        orgFormattedName: get(req, 'user.orgFormattedName', ''),
                        orgId: get(req, 'user.orgId', ''),
                        appRoleName: snakeCase(appRoleName)
                    }
                }
            }
        }
        else {
            setConditions = {
                $set: {
                    ...formattedNewData,
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    actionDetails
                }
            }

            userOrgSetCondition = {
                $set: {
                    userOrganizations
                }
            }
        }

        actionDetails = setActionDetails(actionDetails, formattedOldData, formattedNewData);
        await AppUser.updateOne({ email: email.toLowerCase(), appName, orgFormattedName }, {
            ...setConditions
        });

        await AppUser.updateMany({ email: email.toLowerCase(), appName }, {
            ...userOrgSetCondition
        });

        if (!isEmpty(appUserDetails)) {
            if (appUserDetails.status != status) {
                await AppUserHistory.create({
                    email: email.toLowerCase(),
                    appName,
                    appRoleName: snakeCase(appRoleName),
                    orgId,
                    orgFormattedName,
                    changes: {
                        entityName: "status",
                        oldValue: get(formattedOldData, "status", ""),
                        newValue: get(formattedNewData, "status", "")
                    },
                    createdAt: new Date(),
                    createdBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date(),
                    updatedBy: req.user ? get(req.user, 'email') : 'system'
                })
            }
            if (appUserDetails.skill != skill) {
                await AppUserHistory.create({
                    email: email.toLowerCase(),
                    appName,
                    appRoleName: snakeCase(appRoleName),
                    orgId,
                    orgFormattedName,
                    changes: {
                        entityName: "skill",
                        oldValue: get(formattedOldData, "skill", ""),
                        newValue: get(formattedNewData, "skill", "")
                    },
                    createdAt: new Date(),
                    createdBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date(),
                    updatedBy: req.user ? get(req.user, 'email') : 'system'
                })
            }
            if (appUserDetails.appRoleName != appRoleName) {
                await AppUserHistory.create({
                    email: email.toLowerCase(),
                    appName,
                    appRoleName: snakeCase(appRoleName),
                    orgId,
                    orgFormattedName,
                    changes: {
                        entityName: "appRoleName",
                        oldValue: snakeCase(get(formattedOldData, "appRoleName", "")),
                        newValue: snakeCase(get(formattedNewData, "appRoleName", ""))
                    },
                    createdAt: new Date(),
                    createdBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date(),
                    updatedBy: req.user ? get(req.user, 'email') : 'system'
                })
            }
            if (Object.keys(historyLogs).includes("appRoleName")) {
                let cacheKey = !isEmpty(appName) ? email + "_" + appName : email;
                userCache.deleteUserFromCache(cacheKey);
            };
        }
    }
    else {

        actionDetails["createdAt"] = new Date();
        actionDetails["activatedAt"] = new Date();

        let appUserOrgDetails = await AppUser.findOne({ email: email.toLowerCase(), appName, orgFormattedName: { "$nin": [orgFormattedName] } });
        let userOrganizations = [];
        if (!isEmpty(appUserOrgDetails)) {
            userOrganizations = [...get(appUserOrgDetails, "userOrganizations", []), {
                orgFormattedName,
                orgId,
                appRoleName: snakeCase(appRoleName)
            }];

            await AppUser.updateMany({
                email: email.toLowerCase(),
                appName,
                orgFormattedName: { "$nin": [orgFormattedName] }
            }, {
                userOrganizations
            })
        }
        else {
            userOrganizations = [{
                orgFormattedName,
                orgId,
                appRoleName: snakeCase(appRoleName)
            }];
        }

        let appUserDefaultDetails = await AppUser.findOne({ email: email.toLowerCase(), appName, isDefaultOrg: true });

        await AppUser.updateOne({ email: email.toLowerCase(), appName, orgFormattedName }, {
            $set: {
                ...formattedNewData,
                orgFormattedName,
                orgId,
                isDefaultOrg: !appUserDefaultDetails ? true : false,
                userOrganizations,
                createdBy: req.user ? get(req.user, 'email') : 'system',
                actionDetails
            }
        }, { upsert: true });

    }

    return { ...formattedNewData, historyLogs, message: "Updated Successfully" };
}

const getFormattedAppUserData = (data) => {
    let formattedAppRoleName = snakeCase(get(data, 'appRoleName', ""));

    let formattedData = {
        email: get(data, 'email', '').toLowerCase().trim(),
        appName: get(data, 'appName', '').trim(),
        appRoleName: formattedAppRoleName,
        skill: get(data, 'skill', ''),
        status: get(data, 'status', ''),
        groups: get(data, 'groups', [])
    }

    return formattedData;
}

/** Delete an App User*/
const deleteData = async (req, res) => {
    let updatedData = await updateAppUserDetails(req, "inactive");
    res.json(updatedData)
}

/**Assign Application Role to a set of Employees */
const assignApplicationRole = async (req, res) => {
    const { emails = [], appRoleName, appName } = req.body;

    if (!emails || !appRoleName) throw new BadRequestError('appRoleName or Emails array is missing');

    if (emails.length) {
        await updateApplicationRole(req);
    }

    res.json("Assigned Application Role");
}

const updateApplicationRole = async (req) => {
    let { emails = [], appRoleName, appName, skill, orgFormattedName, orgId } = req.body;
    const uniqEmailIdArray = uniq(emails);
    let invalidEmailArray = [];
    try {
        await Promise.map(uniqEmailIdArray, async (email) => {
            email = email.trim().toLowerCase();

            let validEmail = validateEmailFormat(email);
            if (validEmail) {
                const appRoleDetails = await AppRole.findOne({ appRoleFormattedName: snakeCase(appRoleName), appName, status: "active", orgFormattedName });
                if (!isEmpty(appRoleDetails)) {
                    let updateReq =
                    {
                        "body": {
                            email,
                            appRoleName: snakeCase(appRoleName),
                            appName,
                            skill,
                            orgFormattedName,
                            orgId
                        },
                        "user": req.user
                    }

                    await updateAppUserDetails(updateReq, "active");

                }
                else {
                    throw new BadRequestError("Update Failed: Please select an active role");
                }
            }
            else {
                invalidEmailArray.push(email);
            }
        }, {
            concurrency: 10
        });

        if (!isEmpty(invalidEmailArray) && invalidEmailArray.length > 0) {
            throw new BadRequestError("Update Failed for invalid emails: " + invalidEmailArray.join());
        }

        return;
    } catch (error) {
        throw new Error(error);
    }
}

const sendUserHeartBeat = async (req, res) => {
    try {

        let { email } = get(req, "user", {});
        let lastActivityAt = new Date();
        let appName = get(req, "headers.x-app-origin", "");
        await appUserHelper.saveLastActivity(email, appName, lastActivityAt);

    } catch (error) {
        throw new Error(error);
    }

    res.json("Sent Active User Heartbeat");
}

module.exports = {
    ...commonController,
    listData,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    assignApplicationRole,
    updateAppUserDetails,
    sendUserHeartBeat
}
