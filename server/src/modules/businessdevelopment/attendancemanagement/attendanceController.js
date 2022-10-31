const { size, get, split, toLower, chunk } = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const logger = require('../../../lib/bunyan-logger')('Attendance Controller');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const { Attendance, SAPAttendance, Employee } = require('@byjus-orders/nexemplum/ums');
const { ByjusConfig } = require('@byjus-orders/nexemplum/oms');

const listAttendance = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, model } = req.body;
    model = model || req.model;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { fromDate, toDate } = req.query;

    if (fromDate && toDate) {
        filter["date"] = { $gte: fromDate, $lte: toDate };
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        let collectionName = (model === "Attendance") ? Attendance : SAPAttendance;
        const list = await collectionName.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const updateAttendance = async (req, res) => {
    const { data } = req.body;
    logger.info(`Request from SAP`, data);

    try {

        let sapResponse = await updateSAPAttendance(data);

        if (process.env.NODE_ENV === "development") {
            updateAchieveAttendance();
        }

        let response = {};
        if (sapResponse) {
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

const updateSAPAttendance = async (data) => {
    let formattedData = [];
    await Promise.map(data, async (record) => {
        let empData = await Employee.findOne({ tnlId: get(record, "tnl_id", "").toLowerCase() });

        formattedData.push({
            email: get(empData, "email", "").toLowerCase(),
            sapId: get(record, "sap_id", ""),
            tnlId: get(record, "tnl_id", "").toLowerCase(),
            dailyWorkScheduleStatus: get(record, "daily_work_schedule_status", ""),
            date: moment(get(record, "attendance_date"), "YYYYMMDD").format("YYYY-MM-DD"),
            punchInTime: get(record, "punch_in_time") ? moment(get(record, "punch_in_time"), "HHmmss").format("HH:mm:ss") : "",
            punchOutTime: get(record, "punch_out_time") ? moment(get(record, "punch_out_time"), "HHmmss").format("HH:mm:ss") : "",
            totalHours: get(record, "total_hours", "") ? moment(get(record, "total_hours"), "HHmmss").format("HH:mm:ss") : "",
            attendanceStatus: get(record, "attendance_status", ""),
            achieveStatus: "not_synced"
        });
    });

    //Adding data to SAP collection in chunks of 50
    const chunks = chunk(formattedData, 50);
    for (let i = 0; i < chunks.length; i++) {
        await addChunkToSAPCollection(chunks[i], i);
    }

    return true;
}

const addChunkToSAPCollection = async (formattedData, chunkCount) => {
    /**Adding response into a collection for reference */
    await SAPAttendance.insertMany(formattedData);
    console.log(`Added (${(chunkCount + 1) * 50}) records in SAP collection`);
}

const updateAchieveAttendance = async () => {
    const nonSyncedAttendance = await SAPAttendance.find({
        achieveStatus: "not_synced"
    });

    await Promise.map(nonSyncedAttendance, async (record) => {
        const { _id, tnlId, date } = record;
        let empData = await Employee.findOne({ tnlId });

        if (empData) {
            const email = toLower(empData.email);
            const status = await getLateComingStatus(empData, record);
            await Attendance.updateOne(
                { email, date },
                {
                    $set: {
                        email,
                        name: get(empData, "name", ""),
                        tnlId,
                        date,
                        status
                    }
                }, {
                upsert: true
            });

            await SAPAttendance.updateOne(
                { _id },
                {
                    $set: {
                        achieveStatus: "synced"
                    }
                });
        }
    });
    console.log("Data Successfully Transferred to Achieve")
}

const getLateComingStatus = async (empData, record) => {
    const { role, vertical } = empData;
    let { email, date, punchInTime, attendanceStatus } = record;
    const day = moment(date).format("dddd");

    // Check whether the late request already raised and approved by the manager, status = C (Corrected)
    const isLatestRequestApproved = await Attendance.findOne({ date, email, status: "C" });
    if (isLatestRequestApproved) {
        return "C"
    };

    // Identify late coming rule available for the day 
    const byjusConfigData = await ByjusConfig.findOne({ formattedAppName: "ACHIEVE", formattedModuleName: "LATE_COMING_RULE" });
    const configs = get(byjusConfigData, "configs", []);
    const [lateComingRule] = configs.filter(ele =>
        ele.day === day &&
        ele.roles.includes(role) &&
        ele.verticals.includes(vertical)
    );

    // For EL/CL we shouldn't consider late coming logic.
    if (lateComingRule && attendanceStatus === "P") {
        const punchInTimeConfig = get(lateComingRule, "punchInTime");
        const [configuredHour, configuredMinute] = split(punchInTimeConfig, ":");
        const [punchInHour, punchInMinute] = split(punchInTime, ":");

        if (punchInHour >= configuredHour && punchInMinute > configuredMinute) {
            return "LATE";
        }
    }
    return attendanceStatus;
}

const getSummary = async (req, res) => {
    let { page, limit, sort, filter = {}, model } = req.body;

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
        let stages = await getAggregateStages({}, ["date"]);

        let collectionName = (model === "Attendance") ? Attendance : SAPAttendance;
        const aggregate = collectionName.aggregate(stages);
        summaryList = await collectionName.aggregatePaginate(aggregate, options);

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
            P: {
                "$cond": [{
                    $or: [
                        { $eq: ["$status", "P"] },
                        { $eq: ["$attendanceStatus", "P"] }
                    ]
                }, 1, 0]
            },
            OD: {
                "$cond": [{
                    $or: [
                        { $eq: ["$status", "OD"] },
                        { $eq: ["$attendanceStatus", "OD"] }
                    ]
                }, 1, 0]
            },
            Other: {
                "$cond": [{
                    $and: [
                        { $ne: ["$status", "P"] },
                        { $ne: ["$status", "OD"] },
                        { $ne: ["$attendanceStatus", "P"] },
                        { $ne: ["$attendanceStatus", "OD"] }
                    ]
                }, 1, 0]
            }
        }
    }, {
        "$group": {
            _id: groupByDimension,
            total: { "$sum": 1 },
            P: { "$sum": "$P" },
            OD: { "$sum": "$OD" },
            Other: { "$sum": "$Other" }
        }
    }];
}

module.exports = {
    listAttendance,
    updateAttendance,
    getSummary
}