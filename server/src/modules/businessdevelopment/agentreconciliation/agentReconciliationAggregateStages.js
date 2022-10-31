const getAggregateStages = async () => {
    
    return [{
        "$addFields": {
            not_agreed: {
                "$cond": [{
                    $or: [
                        { $eq: ["$agentStatus", "not_agreed"] }
                    ]
                }, 1, 0]
            },
            agreed: {
                "$cond": [{
                    $or: [
                        { $eq: ["$agentStatus", "agreed"] }
                    ]
                }, 1, 0]
            },
            pending: {
                "$cond": [{
                    $and: [
                        { $ne: ["$agentStatus", "agreed"] },
                        { $ne: ["$agentStatus", "not_agreed"] }
                    ]
                }, 1, 0]
            }
        }
    }, {
        "$group": {
            _id: { reconciledAt: "$reconciledAt" },
            total: { "$sum": 1 },
            agreed: { "$sum": "$agreed" },
            not_agreed: { "$sum": "$not_agreed" },
            pending: { "$sum": "$pending" }
        }
    }];
};
    
module.exports = {
    getAggregateStages
};