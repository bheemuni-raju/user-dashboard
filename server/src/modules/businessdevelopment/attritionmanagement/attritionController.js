const { size, get, isEmpty, isEqual } = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');

const logger = require('../../../lib/bunyan-logger')('Attrition Controller');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const { getDiff } = require('../../core/utils/userUtil');
const { Employee, AttritionDetail } = require('@byjus-orders/nexemplum/ums');

const listAttrition = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, model } = req.body;
    model = model || req.model;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { fromDate, toDate } = req.query;

    if (fromDate && toDate) {

        filter["exitInitiationDate"] = { $gte: fromDate, $lte: new Date(toDate) + 1 };
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await AttritionDetail.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const storeAttrition = async (req, res) => {
    const { data } = req.body;
    logger.info(`Attrition Request from SAP`, data);

    try {

        let attritionResponse = await updateAttrition(data, req.user);

        let response = {};
        if (attritionResponse) {
            response = {
                status: 200,
                message: `Successfully received ${data && data.length} records.`
            }

            console.log('jsonData recieved:: ', data);
        }

        return res.status(200).json(response);

    } catch (error) {
        const response = {
            status: 500,
            message: error.message
        }

        console.log('error occured:: ', error.message);
        return res.status(500).json(response);
    }
}

const updateAttrition = async (data, user) => {
    await Promise.map(data, async (record) => {
        let empData = await Employee.findOne({ tnlId: get(record, "tnl_id", "").toLowerCase() });

        if (!isEmpty(empData)) {
            let updateCondition = {
                email: get(empData, "email", "").toLowerCase(),
                tnlId: get(record, "tnl_id", "").toLowerCase(),
                exitInitiationDate: moment(get(record, "exit_initiation_date"), "YYYYMMDD").format("YYYY-MM-DD"),
                requestType: get(record, "request_type", ""),
                employeeExitReason: get(record, "employee_exit_reason", ""),
                managementExitReason: get(record, "management_exit_reason", ""),
                lastWorkingDate: moment(get(record, "last_working_date"), "YYYYMMDD").format("YYYY-MM-DD")
            }

            await updateAttritionHistory(updateCondition, user);
        }

    }, { concurrency: 50 });

    return true;
}

const updateAttritionHistory = async (updateCondition, user) => {
    let tnlId = get(updateCondition, "tnlId");
    let email = get(updateCondition, "email");

    let oldAttritionData = await AttritionDetail.findOne({ tnlId, email }).lean();

    if (isEmpty(oldAttritionData)) {
        updateCondition["createdAt"] = new Date();
        updateCondition["createdBy"] = user ? get(user, 'email') : 'system';
    }

    await AttritionDetail.updateOne(
        { tnlId, email },
        {
            "$set": {
                ...updateCondition
            }
        }, { upsert: true });

    let newAttritionData = await AttritionDetail.findOne({ tnlId, email }).lean();

    if (!isEmpty(oldAttritionData)) {
        const historyLogs = getDiff(oldAttritionData, newAttritionData, "attrition");
        /**if changes are there, then only update history */
        if (!isEmpty(historyLogs)) {
            await AttritionDetail.updateOne({ tnlId, email },
                {
                    "$push": {
                        history: {
                            changes: historyLogs,
                            updatedBy: user ? get(user, 'email') : 'system',
                            updatedAt: new Date()
                        }
                    },
                    "$set": {
                        "updatedAt": new Date(),
                        "updatedBy": user ? get(user, 'email') : 'system'
                    }
                })
        }
    }
}

module.exports = {
    listAttrition,
    storeAttrition
}