const { extend, get, size, isEmpty, snakeCase } = require('lodash');
const { AssignmentRule } = require('@byjus-orders/nexemplum/ums');
const { GridTemplate } = require('@byjus-orders/nexemplum/oms');

const { NotFoundError, BadRequestError } = require('../../../lib/errors');
const commonController = require("../../../common/dataController");
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const utils = require('../../../lib/utils');
const { getDiff } = require("../../core/utils/userUtil");

/**
* Create a Assignment Rule
*/
const createData = async (req, res) => {
    const { name, ruleCondition } = req.body;

    if (!name) throw new BadRequestError("Invalid Request : Required parameters missing")

    //if (!isJsonString(ruleCondition)) throw new BadRequestError("Invalid Rule Condition");

    const newRecord = new AssignmentRule({
        ...req.body,
        ruleCondition: ruleCondition,
        formattedName: utils.formatName(name),
        createdBy: req.user ? get(req.user, 'email') : 'system',
        createdAt: new Date()
    });

    const savedRecord = await newRecord.save();

    res.json(savedRecord);
}

const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Show the current assignment rule
 */
const readData = (req, res) => {
    res.json(req.assignmentRule)
}

/**
 * Update a assignment rule
 */
const updateData = async (req, res) => {
    let { formattedName, appName } = req.body;
    const oldData = await AssignmentRule.findOne({ formattedName: snakeCase(formattedName), appName }).lean();
    let formattedOldData = getFormattedData(oldData);
    let formattedNewData = getFormattedData(req.body);

    const historyLogs = getDiff(formattedOldData, formattedNewData, "assignmentRule");
    if (!isEmpty(historyLogs)) {
        await AssignmentRule.updateOne({ formattedName: snakeCase(formattedName), appName }, {
            $set: {
                ...formattedNewData,
                updatedBy: req.user ? get(req.user, 'email') : 'system',
                updatedAt: new Date()
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

    res.json({ ...formattedNewData, historyLogs, message: "Updated Successfully" });
}

getFormattedData = (record) => {
    let formattedData = {
        description: get(record, 'description', ''),
        gridId: get(record, 'gridId', ''),
        assignedTo: get(record, 'assignedTo', []),
        ruleCondition: get(record, 'ruleCondition', []),
        searchCriterias: get(record, 'searchCriterias', []),
        anyCriteria: get(record, 'anyCriteria')
    }

    return formattedData;
}

/** Delete a assignment rule*/
const deleteData = async (req, res) => {
    const id = req.assignmentRule._id;

    await AssignmentRule.findByIdAndRemove(id);

    res.json(req.assignmentRule);
}

const ruleByFormattedName = async (req, res, next, formattedName) => {
    const assignmentRule = await AssignmentRule.findOne({
        formattedName
    });

    if (!assignmentRule) throw new NotFoundError

    req.assignmentRule = assignmentRule
    next()
}

const listGridTemplate = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, gridId } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

    if (!isEmpty(gridId)) {
        filter["gridId"] = gridId;
        filter["viewFormattedName"] = "all";
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await GridTemplate.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}


module.exports = {
    ...commonController,
    createData,
    readData,
    updateData,
    deleteData,
    ruleByFormattedName,
    listGridTemplate
}