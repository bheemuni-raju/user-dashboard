'use strict';

const { MasterEmployee } = require('@byjus-orders/nexemplum/ums');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');

const { extend, map, find, uniq, size, cloneDeep, transform, isEmpty, isEqual, get, difference, isObject } = require('lodash');
const commonController = require('../../../common/dataController');

const commonUserController = require('../common/userController');
const logger = require('../../../lib/bunyan-logger')('masterUserController');

const createData = async (req, res) => {
    const { name, email, department } = req.body;
    logger.info({ method: 'createData' }, 'Create a user', name, email, department);
    if (!name || !email) throw new BadRequestError('Invalid Request : Required parameters missing');
    try {

        const newUser = new MasterEmployee({
            ...req.body,
            email: email.toLowerCase(),
            department: department ? [department] : []
        });

        const savedUser = await newUser.save();
        await userUtil.retainActiveDepartmentInMaster(email.toLowerCase());

        const EmployeeCollection = userUtil.getEmployeeCollection(department || "");
        let modelName = getModelNameFromCollection(EmployeeCollection.collectionName);
        req.model = !isEmpty(modelName) ? modelName : "Employee";

        /**Updating respective collection */
        await commonUserController.createData(req, res);
        // logger.info({ method: 'createScData' }, 'Employee created succesfully', savedUser);
        // res.json(savedUser);
    } catch (error) {
        if (error && error.code === 11000) {
            logger.error({ method: 'createData' }, 'Duplicate EmailId', error);
            throw new Error('Employee already exist with this EmailId!');
        }
        logger.error({ method: 'createData' }, 'Employee creation failed', error);
        throw new Error(error);
    }
};

const updateData = async (req, res) => {
    let { name, email, department, campaign, location, permissionTemplate, country, tnlId } = req.body;
    logger.info({ method: 'updateData' }, 'Create a user', name, email, department);


    if (!email) throw new BadRequestError('Invalid Request : Required parameters missing');
    try {
        const EmployeeCollection = userUtil.getEmployeeCollection(department);
        let modelName = getModelNameFromCollection(EmployeeCollection.collectionName);
        req.model = !isEmpty(modelName) ? modelName : "Employee";

        department = (isEmpty(department) || department.length == 0) ? "" : department;
        const savedUser = await MasterEmployee.updateOne({ email }, {
            "$set": {
                tnlId,
                country,
                campaign,
                location,
                permissionTemplate,
                updatedBy: get(req, 'user.email')
            },
            "$addToSet": {
                department: department
            }
        }, {
            new: true
        });

        /**Updating respective collection */
        await commonUserController.updateUserDetails(req, res);

        //res.json(savedUser);
    } catch (error) {
        if (error && error.code === 11000) {
            logger.error({ method: 'updateData' }, 'Duplicate EmailId', error);
            throw new Error('Employee already exist with this EmailId!');
        }
        logger.error({ method: 'updateData' }, 'Employee creation failed', error);
        throw new Error(error);
    }
};

const readData = async (req, res) => {
    let { email, department } = req.body;
    //email = email.trim();
    const EmployeeCollection = userUtil.getEmployeeCollection(department) || Employee;

    if (!email) throw new Error(`email is missing`);
    let data = await EmployeeCollection.findOne({ email });

    /**if not found attach the master data */
    if (!data) {
        data = await MasterEmployee.findOne({ email });
    }

    res.json(data);
}

const getModelNameFromCollection = (collectionName) => {
    const modelMap = {
        'employees': 'Employee',
        'ums_finance_employees': 'FinanceEmployee',
        'ums_ue_employees': 'UeEmployee',
        'ums_sc_employees': 'ScEmployee'
    }

    return modelMap[collectionName];
}

module.exports = {
    ...commonController,
    createData,
    updateData,
    readData
};
