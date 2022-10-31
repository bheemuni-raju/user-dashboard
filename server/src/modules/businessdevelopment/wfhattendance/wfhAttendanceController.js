const { size, get, unionBy, find, sortBy, flattenDeep, isEmpty } = require('lodash');
const { ObjectId } = require("mongodb");
const moment = require('moment');
const Promise = require('bluebird');
const { WfhAttendance , Employee , Role } = require('@byjus-orders/nexemplum/ums');
const { EmployeeRoster } = require('@byjus-orders/nexemplum/achieve');

const { getAggregateStages } = require('./wfhAttendanceAggregateStages');
const inboundVerticals = require('../../../utils/inboundVerticals');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { date,reportingManagerEmailId } = req.query;

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
        const list = await WfhAttendance.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const employeeList = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    let { email } = req.query;

    if (contextCriterias.length === 0) {
        contextCriterias.push({
            selectedColumn: 'role',
            selectedOperator: 'in',
            selectedValue: ["bda", "bdt", "bdat"]
        })
    }

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    if (email) {
        filter["email"] = email;
    }
    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        const list = await Employee.paginate(filter, options);
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const employeeAttendanceData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { email } = req.query;

    if (email) {
        filter["emailId"] = email;
    }

    if(isEmpty(sort)){
        sort={ date: '-1' }
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort
        }

        const list = await WfhAttendance.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const seedBulkAttendance = async (req, res) => {
    let { from, to, status, email } = req.body;
    let warningMessage = "Update is failed";
    try {
        const employeeData = await Employee.findOne({ email });
        let { tnlId = "", name = "", role = "", vertical="", reportingTo={} } = employeeData;
        const reportingValues = reportingTo && Object.values(reportingTo);
        const reportingHierarchySorted = sortBy(flattenDeep(reportingValues), "level");
        const reportingManagerEmail = get(reportingHierarchySorted, "0.userEmail");
        const reportingManagerData = await Employee.findOne({ email: reportingManagerEmail });

        let dates = [];
        while (new Date(from) < new Date(to)) {
            dates.push(from);
            from = moment(from).add(1, 'days').format('YYYY-MM-DD');
        }
        dates.push(to);

        await Promise.map(dates, async (eachDate) => {
            let weekDayName = moment(eachDate).format('dddd');
            let finalAttendance = status;
            let systemAttendance = "present";

            if(weekDayName === "Monday" && vertical === "PreSales Qualifying Team AP&TS"){
                finalAttendance = "week_off";
                systemAttendance = "";
            } else if (["Monday", "Tuesday"].includes(weekDayName) && !inboundVerticals.includes(vertical) &&
            !["Trial Classes Leads", "PreSales Team", "PreSales Team Kerala", "PreSales Qualifying Team AP&TS"].includes(vertical)) {               
                finalAttendance = "week_off";
                systemAttendance = "";
            } else if (["Sunday", "Monday"].includes(weekDayName) &&
            ["PreSales Team", "PreSales Team Kerala"].includes(vertical)){
                finalAttendance = "week_off";
                systemAttendance = "";
            }

            const workflowDetails = {
                workflowHistory : [{
                    updatedByRole: get(req.user, 'role'),
                    updatedByEmail: get(req.user, 'email'),
                    updatedAt: new Date(),
                    attendanceStatus: finalAttendance,
                    workflowStatus: "manual"
                }]
            };

            const verifyDailyAttendance = await WfhAttendance.findOne({
                emailId: email,
                date: eachDate
            });

            const attendanceCheck = get(verifyDailyAttendance, "finalAttendance","");
            if(attendanceCheck && attendanceCheck === status ){
                warningMessage = `Attendance is already marked for the selected date - ${eachDate}`;
                throw new Error(e);
            }    

            await WfhAttendance.updateOne({
                emailId: email,
                date: eachDate
            },
                {
                    $set:
                    {
                        emailId: email,
                        name: name,
                        tnlId: tnlId,
                        role: role,
                        reportingManagerEmailId: reportingManagerEmail,
                        reportingManagerTnlId: get(reportingManagerData, "tnlId", ""),
                        date: eachDate,
                        connectedCalls: -1,
                        talktime: -1,
                        workflowStatus: "",
                        systemAttendance,
                        finalAttendance
                    },
                    $addToSet: workflowDetails
                }, {
                upsert: true
            });
        });

        res.status(200).json({ message: "Successfully Seeded Attendance." });
    } catch (error) {
        return res.status(500).json({ message: warningMessage }, error, res.status);
    }
}

const getSummary = async (req, res) => {
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;

    if(searchCriterias.searchBuilder){
        let searchBuilder =  find(searchCriterias.searchBuilder,{selectedColumn:"_id"});
        if(searchBuilder){
            searchBuilder.selectedColumn="reportingManagerEmailId";
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

        const aggregate = WfhAttendance.aggregate(stages);
        summaryList = await WfhAttendance.aggregatePaginate(aggregate, options);

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

const updateAttendance = async (req, res) => {
    const { body, user } = req;
    const { email: loggedInUserEmail, roleFormattedName } = user;
    const _id = ObjectId(body._id);
    delete body._id;

    try {
        let reportingManager = await Employee.findOne({ email: body.reportingManagerEmailId });

        if (!reportingManager) throw 'Reporting Manager Not Found';

        let resp = await WfhAttendance.updateOne({ _id }, {
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
        let resp = await WfhAttendance.updateOne({ emailId: { $in: emailIds }, date: { $in: dates } }, {
            $set: {
                meetingAttendanceStatus
            }
        });

        res.json({ message: "Meeting Attendance Status Updated successful" });
    } catch (e) {
        res.status(500).json({ error: e, message: " Failed to update meeting attendance status" });
    }
}

const employeeRosterList = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    const { startDate, endDate } = req.query;

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

    filter["date"] = { "$gte": startDate, "$lte": endDate };

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
        }
        const list = await EmployeeRoster.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

module.exports = {
    ...commonController,
    listData,
    getSummary,
    updateAttendance,
    employeeList,
    seedBulkAttendance,
    employeeAttendanceData,
    updateMeetingAttendanceStatus,
    employeeRosterList,
}
