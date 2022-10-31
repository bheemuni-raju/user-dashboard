const { isEmpty } = require('lodash');

const getCustomerDemoSessionsAggregateStages = async (date, selectedEmployeeEmail) => {
    const filter = { date }
    if (!isEmpty(selectedEmployeeEmail)) {
        filter["email"] = selectedEmployeeEmail
    }
    return [{
        "$match": filter
    },
    {
        "$addFields": {
            connectedCall: { $cond: [{ $eq: ["$date", date] }, 1, 0] },
            isConnectedCall: { $cond: [{ $eq: ["$isConnectedCall", true] }, 1, 0] },
            zeroTalktime: { $cond: [{ $eq: ["$actualDuration", 0] }, 1, 0] },
            noEmailId: { $cond: [{ "$gt": ["$email", null] }, 0, 1] },
            talkTime: { $cond: [{ $eq: ["$isConnectedCall", true] }, "$actualDuration", 0] },
        }
    },
    {
        "$group": {
            _id: "customer_demo_sessions",
            uniqueBDA: { $addToSet: "$email" },
            connectedCalls: { $sum: "$connectedCall" },
            eligibleCall: { $sum: "$isConnectedCall" },
            zeroDurationCall: { $sum: "$zeroTalktime" },
            noEmailId: { $sum: "$noEmailId" },
            totalTalkTime: { $sum: "$talkTime" },
            highestTalktime: { $max: "$actualDuration" }
        }
    },
    { "$unwind": "$uniqueBDA" },
    {
        "$group": {

            _id: "$_id",
            uniqueBDAcount: { $sum: 1 },
            connectedCalls: { $first: "$connectedCalls" },
            eligibleCall: { $first: "$eligibleCall" },
            zeroDurationCall: { $first: "$zeroDurationCall" },
            noEmailId: { $first: "$noEmailId" },
            totalTalkTime: { $first: "$totalTalkTime" },
            highestTalktime: { $first: "$highestTalktime" }
        }
    }
    ]
}

module.exports = {
    getCustomerDemoSessionsAggregateStages
};