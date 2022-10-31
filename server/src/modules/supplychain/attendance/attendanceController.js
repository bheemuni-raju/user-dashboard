const { size, get, unionBy, find } = require('lodash');
const { ObjectId } = require("mongodb");
const { ScEmployee } = require('@byjus-orders/nexemplum/ums');
const { Attendance } = require('@byjus-orders/nexemplum/scachieve');

const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
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
        const list = await Attendance.paginate(filter, options);
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

        const aggregate = Attendance.aggregate(stages);
        summaryList = await Attendance.aggregatePaginate(aggregate, options);

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
            agentOpenForDiscussion: {
                "$cond": [{
                    $and: [
                        { $eq: ["$agentRequest.workflowStatus", "agent_dispute_open"] }
                    ]
                }, 1, 0]
            },
            agentRequestRaised: {
                "$cond": [{
                    $and: [
                        { $eq: ["$agentRequest.workflowStatus", "request_raised"] }
                    ]
                }, 1, 0]
            },
            agentRequestApproved: {
                "$cond": [{
                    $and: [
                        { $eq: ["$agentRequest.workflowStatus", "approved"] }
                    ]
                }, 1, 0]
            },
            agentRequestRejected: {
                "$cond": [{
                    $and: [
                        { $eq: ["$agentRequest.workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            },
            totalReportingManagerRequestRaised: {
                "$cond": [{
                    $or: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "request_raised"] },
                        { $eq: ["$reportingManagerRequest.workflowStatus", "approved"] },
                        { $eq: ["$reportingManagerRequest.workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            },
            totalAgentRequestRaised: {
                "$cond": [{
                    $or: [
                        { $eq: ["$agentRequest.workflowStatus", "request_raised"] },
                        { $eq: ["$agentRequest.workflowStatus", "approved"] },
                        { $eq: ["$agentRequest.workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            },
            totalRequestApproved: {
                "$cond": [{
                    $and: [
                        { $eq: ["$workflowStatus", "approved"] }
                    ]
                }, 1, 0]
            },
            totalRequestRejected: {
                "$cond": [{
                    $and: [
                        { $eq: ["$workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            },
            totalRequestPending: {
                "$cond": [{
                    $and: [
                        { $eq: ["$workflowStatus", "request_raised"] }
                    ]
                }, 1, 0]
            },
            totalPresent: {
                "$cond": [{
                    $or: [
                        { $in: ["$finalAttendance", ["present"]] },
                        {
                            $and: [
                                { $eq: [{ $type: "$finalAttendance" }, 'missing'] },
                                { $in: ["$systemAttendance", ['present']] },
                            ]
                        }
                    ]
                }, 1, 0]
            },
            totalAbsent: {
                "$cond": [{
                    $or: [
                        { $in: ["$finalAttendance", ["absent"]] },
                        {
                            $and: [
                                { $eq: [{ $type: "$finalAttendance" }, 'missing'] },
                                { $in: ["$systemAttendance", ['absent']] },
                            ]
                        }
                    ]
                }, 1, 0]
            },
            totalLeave: {
                "$cond": [{
                    $and: [
                        { $eq: ["$finalAttendance", "leave"] }
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
            agentOpenForDiscussion: { "$sum": "$agentOpenForDiscussion" },
            agentRequestRaised: { "$sum": "$agentRequestRaised" },
            agentRequestApproved: { "$sum": "$agentRequestApproved" },
            agentRequestRejected: { "$sum": "$spRequestRejected" },
            totalReportingManagerRequestRaised: { "$sum": "$totalReportingManagerRequestRaised" },
            totalReportingManagerRequestApproved: { "$sum": "$totalReportingManagerRequestApproved" },
            totalReportingManagerRequestRejected: { "$sum": "$totalReportingManagerRequestRejected" },
            totalAgentRequestRaised: { "$sum": "$totalAgentRequestRaised" },
            totalRequestApproved: { "$sum": "$totalRequestApproved" },
            totalRequestRejected: { "$sum": "$totalRequestRejected" },
            totalRequestPending: { "$sum": "$totalRequestPending" },
            totalPresent: { "$sum": "$totalPresent" },
            totalAbsent: { "$sum": "$totalAbsent" },
            totalLeave: { "$sum": "$totalLeave" }
        }
    }];
}

const updateAttendance = async (req, res) => {
    const { body, user } = req;
    const { email: loggedInUserEmail, roleFormattedName } = user;
    const _id = ObjectId(body._id);
    delete body._id;

    try {
        let reportingManager = await ScEmployee.findOne({ email: body.reportingManagerEmailId });

        if (!reportingManager) throw 'Reporting Manager Not Found';

        let resp = await Attendance.updateOne({ _id }, {
            $set: {
                ...body,
                reportingManagerTnlId: reportingManager.tnlId
            },
            $push: {
                workflowHistory: {
                    workflowStatus: "stc_corrected",
                    attendanceStatus: body.finalAttendance,
                    updatedByRole: roleFormattedName,
                    updatedByEmail: loggedInUserEmail,
                    updatedAt: new Date(),
                }
            }
        });

        res.json({ message: "Operation successful" });
    } catch (e) {
        res.status(500).json({ error: e, message: " Failed to update attendance" });
    }

}

const updateMeetingAttendanceStatus = async (req, res) => {
    const { emailIds, dates, meetingAttendanceStatus } = req.body

    try {
        let resp = await Attendance.updateOne({ emailId: { $in: emailIds }, date: { $in: dates } }, {
            $set: {
                meetingAttendanceStatus
            }
        });

        res.json({ message: "Meeting Attendance Status Updated successful" });
    } catch (e) {
        res.status(500).json({ error: e, message: " Failed to update meeting attendance status" });
    }
}

module.exports = {
    ...commonController,
    listData,
    getSummary,
    updateAttendance,
    updateMeetingAttendanceStatus
}
