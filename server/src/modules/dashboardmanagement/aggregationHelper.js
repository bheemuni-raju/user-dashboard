const getAddFieldsStage = () => {
    let fieldStages = {
        totalUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        umsUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "ums"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        imsUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "ims"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        fmsUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "fms"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        omsUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "oms"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        pomsUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "poms"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        lmsUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "lms"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        sosUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "sos"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        mosUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "mos"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        cxmsUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "cxms"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        },
        dfosUserCount: {
            "$cond": [{
                $and: [
                    { $eq: ["$appName", "dfos"] },
                    { $eq: ["$status", "active"] }
                ]
            }, 1, 0]
        }
    };

    return fieldStages;
}

const getGroupUserStage = (groupBy) => {
    return {
        _id: groupBy ? `$${groupBy}` : groupBy,
        totalUsers: { $sum: 1 },
        umsUsers: { $sum: "$umsUserCount" },
        fmsUsers: { $sum: "$fmsUserCount" },
        imsUsers: { $sum: "$imsUserCount" },
        omsUsers: { $sum: "$omsUserCount" },
        pomsUsers: { $sum: "$pomsUserCount" },
        lmsUsers: { $sum: "$lmsUserCount" },
        sosUsers: { $sum: "$sosUserCount" },
        mosUsers: { $sum: "$mosUserCount" },
        cxmsUsers: { $sum: "$cxmsUserCount" },
        dfosUsers: { $sum: "$dfosUserCount" }
    };
}

const getGroupRoleStage = (groupBy) => {
    return {
        _id: groupBy ? `$${groupBy}` : groupBy,
        totalRoles: { $sum: 1 },
        umsRoles: { $sum: "$umsRoleCount" },
        fmsRoles: { $sum: "$fmsRoleCount" },
        imsRoles: { $sum: "$imsRoleCount" },
        omsRoles: { $sum: "$omsRoleCount" },
        pomsRoles: { $sum: "$pomsRoleCount" },
        lmsRoles: { $sum: "$lmsRoleCount" },
        sosRoles: { $sum: "$sosRoleCount" },
        cxmsRoles: { $sum: "$cxmsRoleCount" },
        mosUsers: { $sum: "$mosUserCount" },
        dfosUsers: { $sum: "$dfosUserCount" },
    };
}

const getAggregateUserStages = (matchFilter, isTableData) => {
    let result = [
        {
            "$match": matchFilter
        },
        {
            "$addFields": {
                "umsUserCount": {
                    "$cond": [
                        {
                            "$and": [
                                { "$eq": ["$appName", "ums"] },
                                { "$eq": ["$status", "active"] }
                            ]
                        }, 1, 0]
                },
                "fmsUserCount": {
                    "$cond": [
                        {
                            "$and": [
                                { "$eq": ["$appName", "fms"] },
                                { "$eq": ["$status", "active"] }
                            ]
                        }, 1, 0]
                },
                "imsUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "ims"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "omsUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "oms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "pomsUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "poms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "lmsUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "lms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "sosUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "sos"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "mosUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "mos"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "cxmsUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "cxms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "dfosUserCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "dfos"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                }
            }
        },
        {
            "$addFields": {
                "createdAt": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$actionDetails.createdAt"
                    }
                }
            }
        },
        {
            "$group": getGroupUserStage(!isTableData ? "createdAt" : null)
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ];

    return result;
}

const getAggregateRoleStages = (matchFilter, isTableData) => {
    let result = [
        {
            "$match": matchFilter
        },
        {
            "$addFields": {
                "umsRoleCount": {
                    "$cond": [
                        {
                            "$and": [
                                { "$eq": ["$appName", "ums"] },
                                { "$eq": ["$status", "active"] }
                            ]
                        }, 1, 0]
                },
                "fmsRoleCount": {
                    "$cond": [
                        {
                            "$and": [
                                { "$eq": ["$appName", "fms"] },
                                { "$eq": ["$status", "active"] }
                            ]
                        }, 1, 0]
                },
                "imsRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "ims"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "omsRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "oms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "pomsRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "poms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "lmsRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "lms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "sosRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "sos"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "mosRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "mos"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "cxmsRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "cxms"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                },
                "dfosRoleCount": {
                    "$cond": [{
                        "$and": [
                            { "$eq": ["$appName", "dfos"] },
                            { "$eq": ["$status", "active"] }
                        ]
                    }, 1, 0]
                }
            }
        },
        {
            "$addFields": {
                "createdAt": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$actionDetails.createdAt"
                    }
                }
            }
        },
        {
            "$group": getGroupRoleStage(!isTableData ? "createdAt" : null)
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ];

    return result;
}

module.exports = {
    getAddFieldsStage,
    getGroupUserStage,
    getGroupRoleStage,
    getAggregateUserStages,
    getAggregateRoleStages
}