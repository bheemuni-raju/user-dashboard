const { size, get, find, snakeCase } = require('lodash');
const { SopTracker } = require('@byjus-orders/nexemplum/ums');

const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");

const logger = require('../../../lib/bunyan-logger')("revenyeCycleController");
const batchJobUtil = require('../../batchmanagement/awsBatchService');
const { getPerformanceRatingSummaryStages } = require("./manageSopControllerStages");

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;

    contextCriterias.push({
        selectedColumn: "role",
        selectedOperator: "in",
        selectedValue: ["bdt", "bdat", "bda"]
    });

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { date, reportingManagerEmailId } = req.query;

    if (date) {
        filter["date"] = date;
    }

    if (reportingManagerEmailId) {
        filter["reportingManagerEmailId"] = reportingManagerEmailId;
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        const list = await SopTracker.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const getSummary = async (req, res) => {
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;

    if (searchCriterias.searchBuilder) {
        let searchBuilder = find(searchCriterias.searchBuilder, { selectedColumn: "_id" });
        if (searchBuilder) {
            searchBuilder.selectedColumn = "reportingManagerEmailId";
        }
    }

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    let { date, action } = req.query;
    filter.date = date;

    try {
        if (sort && Object.keys(sort).length === 0) {
            sort = {
                _id: -1
            };
        }

        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };

        let summaryList = [];
        let stages = [];

        if (action === "GET_SUMMARY_BY_DATE") {
            stages = await getAggregateStages({ date }, ["date"]);
        }
        else if (action === "GET_SUMMARY_BY_DEFAULTERS") {
            stages = await getAggregateStages(filter, ["reportingManagerEmailId", "date"]);
        }
        else {
            stages = await getAggregateStages({}, ["date"]);
        }

        const aggregate = SopTracker.aggregate(stages);
        summaryList = await SopTracker.aggregatePaginate(aggregate, options);

        //Transform the api response to fit byjusGrid react component
        res.json({
            docs: summaryList.data,
            total: summaryList.totalCount,
            pages: summaryList.pageCount,
            limit,
            page
        });
    }
    catch (error) {
        throw new Error(error || 'Error in fetching data');
    }
}

const getAggregateStages = async (filter, groupBy) => {
    let groupByDimension = {};
    groupBy.forEach(element => {
        groupByDimension[element] = `$${element}`
    });

    return [{
        "$match": filter
    }, {
        "$addFields": {
            meetingYetToBeMarked: {
                "$cond": [{
                    $or: [
                        { $eq: ["$meetingAttendanceStatus", ""] },
                        { $eq: ["$meetingAttendanceStatus", "meeting_attendance_marking_open"] }
                    ]
                }, 1, 0]
            },
            meetingMarked: {
                "$cond": [{
                    $or: [
                        { $eq: ["$meetingAttendanceStatus", "not_attended"] },
                        { $eq: ["$meetingAttendanceStatus", "attended"] }
                    ]
                }, 1, 0]
            },
            meetingNotMarked: {
                "$cond": [{
                    $or: [
                        { $eq: ["$meetingAttendanceStatus", "not_marked"] }
                    ]
                }, 1, 0]
            },
            meetingAttended: {
                "$cond": [{
                    $and: [
                        { $eq: ["$meetingAttendanceStatus", "attended"] }
                    ]
                }, 1, 0]
            },
            meetingNotAttended: {
                "$cond": [{
                    $and: [
                        { $eq: ["$meetingAttendanceStatus", "not_attended"] }
                    ]
                }, 1, 0]
            },
            talktimeYetToBeUploaded: {
                "$cond": [{
                    $and: [
                        { $eq: ["$talktime", -1] }
                    ]
                }, 1, 0]
            },
            talktimeUploaded: {
                "$cond": [{
                    $and: [
                        { $eq: ["$talktime", -1] }
                    ]
                }, 0, 1]
            },
            tmOpenForDiscussion: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "manager_dispute_open"] }
                    ]
                }, 1, 0]
            },
            tmRequestRaised: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "request_raised"] }
                    ]
                }, 1, 0]
            },
            tmRequestApproved: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "approved"] }
                    ]
                }, 1, 0]
            },
            tmRequestRejected: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            },
            spOpenForDiscussion: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "bda_dispute_open"] }
                    ]
                }, 1, 0]
            },
            spRequestRaised: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "request_raised"] }
                    ]
                }, 1, 0]
            },
            spRequestApproved: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "approved"] }
                    ]
                }, 1, 0]
            },
            spRequestRejected: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            }
        }
    }, {
        "$group": {
            _id: groupByDimension,
            total: { "$sum": 1 },
            meetingYetToBeMarked: { "$sum": "$meetingYetToBeMarked" },
            meetingMarked: { "$sum": "$meetingMarked" },
            meetingNotMarked: { "$sum": "$meetingNotMarked" },
            meetingAttended: { "$sum": "$meetingAttended" },
            meetingNotAttended: { "$sum": "$meetingNotAttended" },
            talktimeYetToBeUploaded: { "$sum": "$talktimeYetToBeUploaded" },
            talktimeUploaded: { "$sum": "$talktimeUploaded" },
            tmOpenForDiscussion: { "$sum": "$tmOpenForDiscussion" },
            tmRequestRaised: { "$sum": "$tmRequestRaised" },
            tmRequestApproved: { "$sum": "$tmRequestApproved" },
            tmRequestRejected: { "$sum": "$tmRequestRejected" },
            spOpenForDiscussion: { "$sum": "$spOpenForDiscussion" },
            spRequestRaised: { "$sum": "$spRequestRaised" },
            spRequestApproved: { "$sum": "$spRequestApproved" },
            spRequestRejected: { "$sum": "$spRequestRejected" },
        }
    }];
}

const generateSopTrackerReport = async (req, res) => {
    const { startDate, endDate, reportName } = req.body;

    try {
        const environmentVars = [
            { name: "START_DATE", value: startDate },
            { name: "END_DATE", value: endDate },
            { name: "SCHEDULED_BY", value: get(req.user, 'email') },
            { name: "JOB_TYPE", value: "sopTrackerReport" }
        ];

        const jobParams = {
            jobName: snakeCase(reportName),
            jobDefinitionName: "achieve-analytics-job",
            jobQueue: "achieve-job-queue",
            environmentVars
        };
        const result = await batchJobUtil.submitJob(
            jobParams.jobName,
            jobParams.jobQueue,
            jobParams.jobDefinitionName,
            environmentVars
        );
        const newJob = new Job({
            jobName: reportName,
            jobId: result.data.jobId,
            jobDefinition: "achieve-analytics-job",
            jobParams: environmentVars
        });
        const savedJob = await newJob.save();

        return res.json({
            status: 200,
            message: 'success',
            data: savedJob
        });
    } catch (err) {
        logger.error('sop tracker - report ', err);
        return res.json(
            { status: 500, err }
        );
    }
}

const getPerformanceRatingSummary = async (req, res) => {

    let { page, limit, sort } = req.body;

    const options = {
        page: page || 1,
        limit: limit || 10,
        sortBy: sort
    };

    try {
        const stages = getPerformanceRatingSummaryStages();
        const aggregate = SopTracker.aggregate(stages);
        aggregateList = await SopTracker.aggregatePaginate(aggregate, options);

        res.json({
            docs: aggregateList.data,
            total: aggregateList.totalCount,
            pages: aggregateList.pageCount,
            limit,
            page
        });
    }
    catch (error) {
        console.log(error);
        return res.json({ status: 500, error });
    }
}

module.exports = {
    ...commonController,
    listData,
    getSummary,
    generateSopTrackerReport,
    getPerformanceRatingSummary
}
