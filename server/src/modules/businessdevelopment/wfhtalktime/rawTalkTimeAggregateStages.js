const { isEmpty } = require('lodash');

const getRawTalktimeAggregateStages = async (date, selectedEmployeeEmail) => {
    const filter = { date }
    if (!isEmpty(selectedEmployeeEmail)) {
        filter["emailId"] = selectedEmployeeEmail
    }
    return [{
        "$match": filter
    },
    {
        "$addFields": {

            connectedCall: { $cond: [{ $eq: ["$date", date] }, 1, 0] },
            isConnectedCall: { $cond: [{ $eq: ["$isConnectedCall", true] }, 1, 0] },
            zeroTalktime: { $cond: [{ $eq: ["$duration", 0] }, 1, 0] },
            noEmailId: { $cond: [{ "$gt": ["$emailId", null] }, 0, 1] },
            talkTime: { $cond: [{ $eq: ["$isConnectedCall", true] }, "$duration", 0] },
        }
    },
    {
        "$group": {
            _id: "$source",
            uniqueBDA: { $addToSet: "$emailId" },
            connectedCalls: { $sum: "$connectedCall" },
            eligibleCall: { $sum: "$isConnectedCall" },
            zeroDurationCall: { $sum: "$zeroTalktime" },
            noEmailId: { $sum: "$noEmailId" },
            totalTalkTime: { $sum: "$talkTime" },
            highestTalktime: { $max: "$duration" },
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
            highestTalktime: { $first: "$highestTalktime" },
        }
    }
    ]
}

module.exports = {
    getRawTalktimeAggregateStages
};