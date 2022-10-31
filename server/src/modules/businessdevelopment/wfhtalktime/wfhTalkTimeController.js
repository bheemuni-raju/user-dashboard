const { size, get, unionBy, isEmpty } = require('lodash');

const { WfhRawTalktime, WfhAttendance, Employee, CustomerDemoSession } = require('@byjus-orders/nexemplum/ums');
const { TalktimeWebhook } = require('@byjus-orders/nexemplum/achieve');

const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");
const {getCustomerDemoSessionsAggregateStages} = require('./customerDemoSessionsAggregateStages');
const {getRawTalktimeAggregateStages} = require('./rawTalkTimeAggregateStages');

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { date ,source } = req.query;

    if (date) {
        filter["date"] = date;
    }

    if (source) {
        filter["source"] = {$in:source.split(',')};
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        const list = await WfhRawTalktime.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const getSummary = async ( req, res) => {
    let { page, limit, sort } = req.body;
    let { date, action  } = req.query;

    try {
        if (sort && Object.keys(sort).length === 0) {
            sort = {
                "cycleInfo.start": "desc"
            };
        }

        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };

        let stages = await getAggregateStages({}, ["date"]);
        let aggregate = WfhRawTalktime.aggregate(stages);
        let summaryList = await WfhRawTalktime.aggregatePaginate(aggregate, options);

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

const getTalktimeCohortSummary = async ( req, res) => {
    let { page, limit, sort } = req.body;

    try {
        if (sort && Object.keys(sort).length === 0) {
            sort = {
                "cycleInfo.start": "desc"
            };
        }

        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };

        let stages = await getTalkTimeCohortAggregateStages({});
        let aggregate = WfhAttendance.aggregate(stages);
        let summaryList = await WfhAttendance.aggregatePaginate(aggregate, options);

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
            totalMapped: {
                "$cond": [{
                    $and: [
                        { $eq: ["$isMapped", true] }
                    ]
                }, 1, 0]
            },
            totalNotMapped: {
                "$cond": [{
                    $and: [
                        { $ne: ["$isMapped", true] }
                    ]
                }, 1, 0]
            },
            totalWeb: {
                "$cond": [{
                    $or: [
                        { $eq: ["$source", "ameyo_web"] }
                    ]
                }, 1, 0]
            },
            webMapped: {
                "$cond": [{
                    $and: [
                        { $eq: ["$source", "ameyo_web"] },
                        { $eq: ["$isMapped", true] }
                    ]
                }, 1, 0]
            },
            webNotMapped: {
                "$cond": [{
                    $and: [
                        { $eq: ["$source", "ameyo_web"] },
                        { $ne: ["$isMapped", true] }
                    ]
                }, 1, 0]
            },
            totalIvr: {
                "$cond": [{
                    $or: [
                        { $eq: ["$source", "ameyo_ivr"] }
                    ]
                }, 1, 0]
            },
            ivrMapped: {
                "$cond": [{
                    $and: [
                        { $eq: ["$source", "ameyo_ivr"] },
                        { $eq: ["$isMapped", true] }
                    ]
                }, 1, 0]
            },
            ivrNotMapped: {
                "$cond": [{
                    $and: [
                        { $eq: ["$source", "ameyo_ivr"] },
                        { $ne: ["$isMapped", true] }
                    ]
                }, 1, 0]
            }
        }
    }, {
        "$group": {
            _id: groupByDimension,
            total: { "$sum": 1 },
            totalMapped: { "$sum": "$totalMapped" },
            totalNotMapped: { "$sum": "$totalNotMapped" },
            totalWeb: { "$sum": "$totalWeb" },
            webMapped :{ "$sum":"$webMapped"},
            webNotMapped :{ "$sum":"$webNotMapped"},
            totalIvr: { "$sum": "$totalIvr" },
            ivrMapped: { "$sum": "$ivrMapped" },
            ivrNotMapped: { "$sum": "$ivrNotMapped" }
        }
    },
    {
        '$sort': {
            '_id.date': -1
        }
    }];
}

const getTalkTimeCohortAggregateStages = async (filter) => {
    let tt_1_min = 1*60;
    let tt_90_min = 90*60;
    let tt_120_min = 120*60;
    let cohort_0_condition = { $lt: ["$talktime", tt_1_min] };
    let cohort_1_90_condition = [
        { $gte: ["$talktime", tt_1_min] },
        { $lt: ["$talktime", tt_90_min] }
    ]
    let cohort_91_120_condition = [
        { $gte: ["$talktime", tt_90_min] },
        { $lt: ["$talktime", tt_120_min] }
    ]
    let cohort_above_120_condition = { $gte: ["$talktime", tt_120_min] };
    let reportingManagerDiputeRaisedCondition ={ 
        $or: [
        { $eq: ["$reportingManagerRequest.workflowStatus", "request_raised"] },
        { $eq: ["$reportingManagerRequest.workflowStatus", "approved"] },
        { $eq: ["$reportingManagerRequest.workflowStatus", "rejected"] }
    ]};
    let bdaDiputeRaisedCondition = { 
        $or: [
        { $eq: ["$salesPersonRequest.workflowStatus", "request_raised"] },
        { $eq: ["$salesPersonRequest.workflowStatus", "approved"] },
        { $eq: ["$salesPersonRequest.workflowStatus", "rejected"] }
    ]};

    return [{
        "$match": filter
    }, {
        "$addFields": {
            cohort_0: {
                "$cond": [{
                    $and: [
                        cohort_0_condition
                    ]
                }, 1, 0]
            },
            cohort_1_90: {
                "$cond": [{
                    $and: [
                        ...cohort_1_90_condition
                    ]
                }, 1, 0]
            },            
            cohort_90_120: {
                "$cond": [{
                    $and: [
                        ...cohort_91_120_condition
                    ]
                }, 1, 0]
            },            
            cohort_above_120: {
                "$cond": [{
                    $and: [
                        cohort_above_120_condition
                    ]
                }, 1, 0]
            },
            cohort_0_tm_dispute_raised: {
                "$cond": [{
                    $and: [
                        cohort_0_condition,
                        reportingManagerDiputeRaisedCondition
                    ]
                }, 1, 0]
            },
            cohort_1_90_tm_dispute_raised: {
                "$cond": [{
                    $and: [
                        ...cohort_1_90_condition,
                        reportingManagerDiputeRaisedCondition
                    ]
                }, 1, 0]
            },            
            cohort_90_120_tm_dispute_raised: {
                "$cond": [{
                    $and: [
                        ...cohort_91_120_condition,
                        reportingManagerDiputeRaisedCondition
                    ]
                }, 1, 0]
            },            
            cohort_above_120_tm_dispute_raised: {
                "$cond": [{
                    $and: [
                        cohort_above_120_condition,
                        reportingManagerDiputeRaisedCondition
                    ]
                }, 1, 0]
            },
            cohort_0_bda_dispute_raised: {
                "$cond": [{
                    $and: [
                        cohort_0_condition,
                        bdaDiputeRaisedCondition
                    ]
                }, 1, 0]
            },
            cohort_1_90_bda_dispute_raised: {
                "$cond": [{
                    $and: [
                        ...cohort_1_90_condition,
                        bdaDiputeRaisedCondition
                    ]
                }, 1, 0]
            },            
            cohort_90_120_bda_dispute_raised: {
                "$cond": [{
                    $and: [
                        ...cohort_91_120_condition,
                        bdaDiputeRaisedCondition
                    ]
                }, 1, 0]
            },            
            cohort_above_120_bda_dispute_raised: {
                "$cond": [{
                    $and: [
                        cohort_above_120_condition,
                        bdaDiputeRaisedCondition
                    ]
                }, 1, 0]
            }                                  
        }
    }, {
        "$group": {
            _id: "$date",
            cohort_0: { "$sum": "$cohort_0" },
            cohort_1_90: { "$sum": "$cohort_1_90" },
            cohort_90_120 :{ "$sum":"$cohort_90_120"},
            cohort_above_120 :{ "$sum":"$cohort_above_120"},
            cohort_0_tm_dispute_raised: { "$sum": "$cohort_0_tm_dispute_raised" },
            cohort_1_90_tm_dispute_raised: { "$sum": "$cohort_1_90_tm_dispute_raised" },            
            cohort_90_120_tm_dispute_raised: { "$sum": "$cohort_90_120_tm_dispute_raised" },
            cohort_above_120_tm_dispute_raised: { "$sum": "$cohort_above_120_tm_dispute_raised" },
            cohort_0_bda_dispute_raised : { "$sum": "$cohort_0_bda_dispute_raised" },
            cohort_1_90_bda_dispute_raised : { "$sum": "$cohort_1_90_bda_dispute_raised" },
            cohort_90_120_bda_dispute_raised : { "$sum": "$cohort_90_120_bda_dispute_raised" },
            cohort_above_120_bda_dispute_raised : { "$sum": "$cohort_above_120_bda_dispute_raised" }           
        }
    },
    {
        '$sort': {
            '_id': -1
        }
    }];
}

const mapTalktime =async (req,res)=>{
    let { date,email ,phone,connectedCalls,talktime, source} = req.body;
    email = email.toLowerCase();
    try{

        let query ={
            date,
            phone
        }

        if(source ==="ameyo_web"){
            query ={
                date,
                email
            }
        }

        let employeeDoc = await Employee.findOne({email:email});

        let resp = await WfhRawTalktime.updateOne(query,{
            $set:{
                email,
                name: employeeDoc.name,
                tnlId: employeeDoc.tnlId,
                isMapped : true
            }
        });

        resp = await WfhAttendance.updateOne({
            date,
            emailId: email
        },{
            $set:{
                talktime,
                connectedCalls,
                tnlId : employeeDoc.tnlId,
                name: employeeDoc.name
            }
        });

        res.json({
            message: "Talktime successfully mapped to attendance"
        });
           
    }catch(e){
        res.status(500).json({
            message: "Failed to map talktime to attendance"
        })
    }
}

const rawTalktimeList = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    const { selectedDate } = req.query;

    contextCriterias.push({
        selectedColumn: "date",
        selectedOperator: "in",
        selectedValue: [selectedDate],
    })

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    
    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
        }
        const list = await WfhRawTalktime.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const talktimeWebhookList = async (req, res) => {
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
        const list = await TalktimeWebhook.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const talktimeSummary = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, model } = req.body;
    const { date, selectedEmployeeEmail } = req.query;

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };

        let stages = await getRawTalktimeAggregateStages(date, selectedEmployeeEmail);
        let aggregate = WfhRawTalktime.aggregate(stages);
        let rawTalkTimeData = await WfhRawTalktime.aggregatePaginate(aggregate, options);

        stages = await getCustomerDemoSessionsAggregateStages(date, selectedEmployeeEmail);
        aggregate = CustomerDemoSession.aggregate(stages);
        const customerDemoSessionData = await CustomerDemoSession.aggregatePaginate(aggregate, options);

        const { data: rawTalktimeDetails } = rawTalkTimeData;
        const { data: customerDemoSessionDetails } = customerDemoSessionData;

        const totalDetails = await totalTalkTimeData(...rawTalktimeDetails, ...customerDemoSessionDetails);
        totalDetails._id = "TOTAL";
        const talktimeSummaryData = [...rawTalktimeDetails, ...customerDemoSessionDetails, totalDetails];

        res.json({
            docs: talktimeSummaryData,
            total: talktimeSummaryData.length,
            pages: talktimeSummaryData.pageCount,
            limit,
            page
        });
    }
    catch (error) {
        console.log(error)
        throw new Error(error || 'Error in fetching data');
    }
}

const totalTalkTimeData = async (...talktimeDetails) => {
    return talktimeDetails.reduce((a, b) => {
        for (let k in b) {
            if (b.hasOwnProperty(k))
                a[k] = (a[k] || 0) + b[k];
        }
        return a;
    }, {});
}

module.exports = {
    ...commonController,
    listData,
    getSummary,
    mapTalktime,
    getTalktimeCohortSummary,
    rawTalktimeList,
    talktimeWebhookList,
    talktimeSummary,
}
