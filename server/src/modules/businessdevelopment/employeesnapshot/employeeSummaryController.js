const getAggregateStages = async (cycleId) => {
    let stages = [];

    const extraStages = additionalStages();
    stages.push(...extraStages);

    return stages;
}

const additionalStages = () => {
    let group = {
        "_id": "$cycle_name",
        "bdts": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "bdt"] }] }, "$employee_email", "$noval"]
            }
        },
        "bdats": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "bdat"] }] }, "$employee_email", "$noval"]
            }
        },
        "bdas": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "bda"] }] }, "$employee_email", "$noval"]
            }
        },
        "bdtms": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "bdtm"] }] }, "$employee_email", "$noval"]
            }
        },
        "teamManagers": {
            "$addToSet": {
                "$cond": [{ $and: [{ $eq: ["$role", "team_manager"] }] }, "$employee_email", "$noval"]
            }
        },
        "senior_bda": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "senior_bda"] }] }, "$employee_email", "$noval"]
            }
        },
        "assistant_senior_manager": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "assistant_senior_manager"] }] }, "$employee_email", "$noval"]
            }
        },
        "assistant_senior_bdtm": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "assistant_senior_bdtm"] }] }, "$employee_email", "$noval"]
            }
        },
        "senior_bdtms": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "senior_bdtm"] }] }, "$employee_email", "$noval"]
            }
        },
        "seniorManagers": {
            "$addToSet": {
                "$cond": [{ $and: [{ $eq: ["$role", "senior_manager"] }] }, "$employee_email", "$noval"]
            }
        },
        "avps": {
            "$addToSet": {
                "$cond": [{ $and: [{ $eq: ["$role", "avp"] }] }, "$employee_email", "$noval"]
            }
        },
        "director": {
            "$addToSet": {
                "$cond": [{ $and: [{ $eq: ["$role", "director"] }] }, "$employee_email", "$noval"]
            }
        },
        "team_heads": {
            "$addToSet": {
                "$cond": [{ "$and": [{ "$eq": ["$role", "team_head"] }] }, "$employee_email", "$noval"]
            }
        }
    }

    let addToFields = {
        bdtCount: { $size: "$bdts" },
        bdaTCount: { $size: "$bdats" },
        bdaCount: { $size: "$bdas" },
        seniorBdaCount: { $size: "$senior_bda" },
        bdtmCount: { $size: "$bdtms" },
        seniorBdtmCount: { $size: "$senior_bdtms" },
        assistantSeniorManagerCount: { $size: "$assistant_senior_manager" },
        assistantSeniorBdtmCount: { $size: "$assistant_senior_bdtm" },
        tmCount: { $size: "$teamManagers" },
        smCount: { $size: "$seniorManagers" },
        avpCount: { $size: "$avps" },
        directorCount: { $size: "$director" },
        thCount: { $size: "$team_heads" }
    };

    group["agms"] = {
        "$addToSet": {
            "$cond": [{ $and: [{ $eq: ["$role", "agm"] }] }, "$employee_email", "$noval"]
        }
    };

    group["gms"] = {
        "$addToSet": {
            "$cond": [{ $and: [{ $eq: ["$role", "gm"] }] }, "$employee_email", "$noval"]
        }
    };

    addToFields["agmCount"] = { $size: "$agms" };
    addToFields["gmCount"] = { $size: "$gms" };

    return [{
        "$group": group
    }, {
        "$addFields": addToFields
    }];
}

module.exports = {
    getAggregateStages
}