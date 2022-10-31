const moment = require('moment');
const { AppUser, AppRole } = require('@byjus-orders/nexemplum/ums');
const { getAddFieldsStage, getGroupUserStage, getAggregateUserStages, getAggregateRoleStages } = require('./aggregationHelper');
const { isEmpty } = require('lodash');

const getUserOverview = async (req, res) => {
    let { startDate, endDate, groupByDate = "actionDetails.createdAt", subType } = req.body;
    startDate = !isEmpty(startDate) ? startDate : moment().add(-7, "days").add(330, 'minutes');
    endDate = !isEmpty(endDate) ? endDate : moment().add(6, "days").add(331, 'minutes');

    const userAggregate = await AppUser.aggregate([{
        $facet: {
            "userGraphData": getCommonStages({ startDate: startDate, endDate: endDate, groupBy: groupByDate, subType, isTableData: false, graphType: "user" }),
            "userTableData": getCommonStages({ startDate: startDate, endDate: endDate, groupBy: groupByDate, subType, isTableData: true, graphType: "user" }),
            "statsData": getAllRecordStats({ groupBy: null })
        }
    }]);

    const roleAggregate = await AppRole.aggregate([{
        $facet: {
            "roleGraphData": getCommonStages({ startDate: startDate, endDate: endDate, groupBy: groupByDate, subType, isTableData: false, graphType: "role" }),
            "roleTableData": getCommonStages({ startDate: startDate, endDate: endDate, groupBy: groupByDate, subType, isTableData: true, graphType: "role" }),
        }
    }]);

    let userStats = userAggregate && userAggregate[0] || {};
    let roleStats = roleAggregate && roleAggregate[0] || {};

    const finalStats = { ...userStats, ...roleStats };
    res.send(finalStats);
}

const getCommonStages = ({ startDate, endDate, groupBy, subType, isTableData, graphType }) => {
    const matchFilter = {
        "actionDetails.createdAt": { $type: 9 },
        [groupBy]: {
            $gte: new Date(moment(startDate).format('YYYY-MM-DDT00:00:00.000Z')),
            $lte: new Date(moment(endDate).format('YYYY-MM-DDT23:59:59.000Z'))
        }
    };

    if (subType && subType !== "all") {
        matchFilter["appName"] = subType;
    }

    const graphData = (graphType === "user") ? getAggregateUserStages(matchFilter, isTableData) : getAggregateRoleStages(matchFilter, isTableData);
    return graphData
}

const getAllRecordStats = ({ groupBy }) => {
    return [{
        $match: {}
    }, {
        $addFields: getAddFieldsStage()
    }, {
        $group: getGroupUserStage(groupBy)
    }, {
        $sort: { "_id": 1 }
    }];
}

module.exports = {
    getUserOverview
}