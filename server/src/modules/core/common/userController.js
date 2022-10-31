'use strict';
const mongoose = require('mongoose');
const { isEmpty, get, isArray, remove, size } = require('lodash');

const bunyan = require('../../../lib/bunyan-logger');
const logger = bunyan('userController');

const { Employee } = require('@byjus-orders/nexemplum/ums');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const permissionList = require('../../../lib/permissionList');
const { getDiff } = require('../utils/userUtil');
const { updateContextCriteriaBasedOnHierarchyPermissions } = require('../../settings/hierarchy/utils/hierarchyUtil');
const employeeReferralController = require('../../businessdevelopment/employeereferral/employeeReferralController');


const listData = async (req, res) => {
    let userPermissions = req.user.permissions;
    let hierarchyBasedPermissions = get(permissionList, 'hierarchy', {});
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, model } = req.body;
    model = model || req.model;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    contextCriterias = updateContextCriteriaBasedOnHierarchyPermissions(userPermissions, hierarchyBasedPermissions, contextCriterias, "department");

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select,
            lean: true
        };

        const list = await mongoose.models[model].paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const createData = async (req, res) => {
    const { model } = req;
    const { name, email } = req.body;
    logger.info({ method: 'createData' }, 'Create a user', name, email);
    if (!name || !email) throw new BadRequestError('Invalid Request : Required parameters missing');
    try {

        let empObject = {
            ...req.body,
            createdBy: req.user ? get(req.user, 'email') : 'system',
            "updateCounter": 0,
            "reconciliationDetails": {
                "status": "no"
            }
        }

        const newUser = new mongoose.models[model](empObject);
        const savedUser = await newUser.save();
        await userUtil.retainActiveDepartmentInMaster(email);

        if (!isEmpty(req) && !isEmpty(req.body)) {
            let departmentValue = req.body.department;

            //If department is of type array in master, fetch the first index 
            if (!isEmpty(departmentValue)) {
                if (isArray(departmentValue)) {
                    departmentValue = departmentValue[0];
                }
            }
            else {
                departmentValue = '';
            }

            req.body.department = departmentValue;
            employeeReferralController.updateRhUserData(req);
        }
        logger.info({ method: 'createData' }, 'Employee created succesfully', savedUser);
        res.json(savedUser);
    } catch (error) {
        if (error && error.code === 11000) {
            if (error.message.includes("email_1")) {
                logger.error({ method: 'createData' }, 'Duplicate Email', error);
                throw new Error('Employee already exist with this EmailId!');
            }
            else if (error.message.includes("tnlId_1")) {
                logger.error({ method: 'createData' }, 'Duplicate TnlId', error);
                throw new Error('Employee already exist with this TnlId!');
            }
            throw new Error(error.message);
        }
        logger.error({ method: 'createData' }, 'Employee creation failed', error);
        throw new Error(error);
    }
};

const updateUserDetails = async (req, res) => {
    const { model } = req;
    let { email, department } = req.body;

    try {
        /**Get user old details and format it to perform diff on it */
        const oldData = await getUserDataByEmailId(email, model);
        const formattedOldData = oldData;
        /**Update Employee with payload passed */
        const updateObj = req.body;
        department = getDepartmentValue(department);
        if (updateObj) {
            let employee = await mongoose.models[model].findOne({ email });
            if (isEmpty(employee)) {

                updateObj["reconciliationDetails"] = {
                    "status": "no"
                }

                let nonSalesEmployee = await Employee.findOne({ email, status: "non_sales" });
                if (!isEmpty(nonSalesEmployee)) {
                    let { history, updateCounter, reconciliationDetails } = nonSalesEmployee;
                    updateObj["history"] = history;
                    updateObj["updateCounter"] = updateCounter;
                    updateObj["reconciliationDetails"] = !isEmpty(reconciliationDetails) ? reconciliationDetails : updateObj["reconciliationDetails"];
                }
            }

            await mongoose.models[model].updateOne({ email }, {
                "$set": {
                    ...updateObj,
                    department
                }
            }, { upsert: true });
        }
        else {
            throw new Error("Please enter valid Filled By byjus email id");
        }

        /**Get user new details and format it to perform diff on it */
        const newData = await getUserDataByEmailId(email, model);
        const formattedNewData = newData;
        const historyLogs = getDiff(formattedOldData, formattedNewData, "user");

        /**if changes are there, then only update history */
        if (!isEmpty(historyLogs)) {
            let employee = await mongoose.models[model].findOne({ email });
            let history = get(employee, "history", []);

            await mongoose.models[model].updateOne({ email }, {
                $push: {
                    history: {
                        changes: historyLogs,
                        updatedBy: req.user ? get(req.user, 'email') : 'system',
                        updatedAt: new Date()
                    }
                },
                $set: {
                    "updateCounter": history.length + 1,
                    "selfReconciliationDetails.reconciliationRequired": "yes"
                }
            })

            await userUtil.retainActiveDepartmentInMaster(email);
            employeeReferralController.updateRhUserData(req);
        }

        res.json({ historyLogs, message: 'Updated Successfully' });
    } catch (error) {
        if (error && error.code === 11000) {
            if (error.message.includes("tnlId_1")) {
                logger.error({ method: 'updateUserDetails' }, 'Duplicate TnlId', error);
                throw new Error('Employee already exist with this TnlId!');
            }
            throw new Error(error.message);
        }

        logger.error({ method: 'updateUserDetails' }, 'Employee updation failed', error);
        throw new Error(error);
    }
}

const getDepartmentValue = (department) => {
    if (isArray(department)) {
        remove(department, v => !v); //remove empty values in department if any
        return department[0];
    }
    else {
        return department || "";
    }
}

const getUserDataByEmailId = async (emailId, model) => {
    const user = await mongoose.models[model].findOne({
        email: emailId
    }).lean();

    return user;
};

const readData = async (req, res) => {
    const { model } = req;
    const email = req.params.email;

    if (!email) throw new Error(`email is missing.`);
    const data = await mongoose.models[model].findOne({ email }).lean();

    if (data) {
        res.sendWithMetaData(data);
    }
    else {
        throw new Error(`${email} not found in ${model} Department`);
    }
}


const getUserComments = async (req, res) => {
    const { model } = req;
    const { email } = req.query;

    if (!email) throw new Error('email is missing');

    try {
        const userData = await mongoose.models[model].findOne({ email }).lean();

        if (userData) {
            res.json(userData.comments || []);
        }
        else {
            throw new Error(`${email} is not found`);
        }
    } catch (error) {
        throw new Error(error);

    }
}

const updateUserComments = async (req, res) => {
    const { model } = req;
    const { email, comment, commentedBy } = req.body;

    if (!email) throw new Error('email is missing');

    try {
        const savedData = await mongoose.models[model].findOneAndUpdate({ email }, {
            $addToSet: {
                "comments": {
                    comment,
                    commentedBy,
                    commentedAt: new Date()
                }
            }
        }, {
            new: true
        });

        res.json(savedData);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    listData,
    createData,
    updateUserDetails,
    getUserDataByEmailId,
    getUserComments,
    updateUserComments,
    readData
};
