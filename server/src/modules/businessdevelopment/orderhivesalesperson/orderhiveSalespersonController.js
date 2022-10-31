const { extend, find, size, get, isEmpty } = require('lodash');
const request = require('request-promise');
const { OrderhiveSalesperson } = require('@byjus-orders/nexemplum/oms');
const { Employee } = require('@byjus-orders/nexemplum/ums');

const { Orderhive } = require('@byjus-orders/tyrion-plugins');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const { NotFoundError, BadRequestError } = require('../../../lib/errors')
const commonController = require("../../../common/dataController")
const utils = require('../../../lib/utils');
const config = require('../../../config');
const bunyan = require('../../../lib/bunyan-logger');
const logger = bunyan('OrderhiveSalespersonController');

const { setupOHToken } = require('../../../config/setupToken');
const permissionList = require('../../../lib/permissionList');
const { updateContextCriteriaBasedOnHierarchyPermissions } = require('../../settings/hierarchy/utils/hierarchyUtil');

/**
* List of grid data
*/
const listData = async (req, res) => {
    let userPermissions = req.user.permissions;
    let hierarchyBasedPermissions = get(permissionList, 'hierarchy', {});
    let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    contextCriterias = updateContextCriteriaBasedOnHierarchyPermissions(userPermissions, hierarchyBasedPermissions, contextCriterias, "departmentFormattedName");

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        const list = await OrderhiveSalesperson.paginate(filter, options)
        res.json(list)
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

/**
 *  Create a OrderhiveSalesperson 
 */
const createData = async (req, res) => {
    const { email } = req.body
    logger.info({ method: 'createData' }, 'Create a OrderhiveSalesperson', JSON.stringify(req.body))

    try {
        if (!email) throw new Error(`Email is missing`);
        let newOHUserDetails = {};

        const existingOhUser = await OrderhiveSalesperson.findOne({ username: email });

        if (existingOhUser) {
            throw new Error(`User ${email} is already added on OH salesperson list`);
        }
        else {
            newOHUserDetails = await addUserOnOH(email);

            const newOHUser = new OrderhiveSalesperson({
                ...newOHUserDetails
            });

            await Employee.findOneAndUpdate({ email: email }, {
                "$set": {
                    'tags.isAddedToOH': true
                }
            });

            const savedOhUser = await newOHUser.save()
            res.json({ savedOhUser: savedOhUser, status: true })
        }
    }
    catch (error) {
        logger.error({ method: 'createData' }, error)
        res.status(500).send({ error: error.message, status: false });
    }
}

const addUserOnOH = async (email) => {
    const ohClient = await setupOHToken();
    const payload = {
        "method": "sales_person",
        "tokenId": config.orders.OH_TOKEN_ID,
        "tenantId": "811",
        "term": email
    };
    const option = {
        uri: config.orders.OH_BASE_URL,
        method: 'PUT',
        body: payload,
        json: true
    }
    try {
        const ohResponse = await ohClient.callOh(payload);

        const { status, users } = ohResponse;
        let userData = null;
        if (status) {
            userData = find(users, { username: email });
        }

        if (userData) {
            const { userId, employee_code, username } = userData;

            return {
                username,
                userId,
                employee_code
            }
        }
        else {
            throw new Error(`${email} is not added on OH yet. Please get it added and then try`);
        }
    }
    catch (error) {
        throw new Error(error);
    }
}

/**
 * Show the current OHUser Data
 */
const readData = (req, res) => {
    res.json(req.vertical)
    logger.info({ method: 'readData' }, 'Show the current vertical', JSON.stringify(req.vertical))
}

/**
 * Update OHUser Details
 */
const updateData = async (req, res) => {
    logger.info({ method: 'updateData' }, 'Update a vertical');

    try {
        let { userId, username, employee_code } = req.body;
        if (!userId || !username) throw new Error('userId or username is missing');

        await OrderhiveSalesperson.findOneAndUpdate({ userId }, {
            $set: {
                ...req.body
            }
        });

        res.json(`Updated successfully`);
    } catch (error) {
        throw new Error(error);
    }
}

/** Delete a vertical*/
const deleteData = async (req, res) => {
    logger.info({ method: 'deleteData' }, 'Delete a OH User');

    try {
        let { email } = req.body;
        if (!email) throw new Error('email is missing');

        email = email.toLowerCase();
        await OrderhiveSalesperson.findOneAndDelete({ username: email });

        res.json(`Deleted successfully`);
    } catch (error) {
        throw new Error(error);
    }
}

const syncOhUserId = async (req, res) => {
    const { email, currentUserId } = req.body;
    const ohClient = await setupOHToken();
    const payload = {
        "method": "sales_person",
        "tokenId": config.orders.OH_TOKEN_ID,
        "tenantId": "811",
        "term": email
    };

    try {
        const ohResponse = await ohClient.callOh(payload);
        const { status, users } = ohResponse;

        if (!status || isEmpty(users) || users.length < 1) {
            throw new Error("No User found");
        }
        let userData = null;
        userData = find(users, { username: email });
        if (userData) {
            const { userId } = userData;
            if (currentUserId !== userId) {
                await OrderhiveSalesperson.findOneAndUpdate({ username: email }, {
                    "$set": {
                        userId
                    }
                });
            }
        }
        res.json({ status });
    }
    catch (error) {
        logger.error({ method: 'syncOhUserId' }, error)
        res.status(500).send({ error: error.message, status: false });
    }
}

const getRoleIdFromOH = async (roleName) => {
    const ohClient = await setupOHToken();
    const payload = {
        "method": "getRoles",
        "tenantId": 811
    };

    try {
        const ohResponse = await ohClient.callOh(payload);
        const { status, roles } = ohResponse;
        let roleId = null;
        if (status) {
            roles.filter(role => {
                if (role.Role.name === roleName) {
                    roleId = role.Role.id;
                }
            });
        }

        return roleId;

    }
    catch (error) {
        console.log(error);
    }
}

const createUserInOH = async (req, res) => {
    const { email, tnlId, name } = req.body;
    const ohClient = await setupOHToken();
    let roleId = await getRoleIdFromOH("Sales User");
    const payload = {
        "method": "create_user",
        "tokenId": config.orders.OH_TOKEN_ID,
        "tenantId": 811,
        "name": name,
        "username": email,
        "employee_code": tnlId,
        "role_id": roleId
    };

    try {
        let response = {};
        if (!isEmpty(roleId)) {
            const ohResponse = await ohClient.callOh(payload);
            const { status, user } = ohResponse;

            if (status) {
                response = {
                    status,
                    user
                };
            }
            else {
                let errorMsg = JSON.parse(user);
                response = {
                    status,
                    error: "OH User Creation Failed: " + get(errorMsg, "username", "") + " " + get(errorMsg, "employee_code", "")
                }
            }
        }
        else {
            response = {
                status: false,
                error: "Invalid OH Role"
            }
        }

        console.log(response);
        res.json({ ...response });
    }
    catch (error) {
        logger.error({ method: 'createUserInOH' }, error)
        res.status(500).send({ error: error.message, status: false });
    }
}

module.exports = {
    ...commonController,
    listData,
    createData,
    readData,
    updateData,
    deleteData,
    syncOhUserId,
    createUserInOH
}
