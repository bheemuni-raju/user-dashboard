const mongoose = require('mongoose');
const { Role, SubDepartment } = require('@byjus-orders/nexemplum/ums');
const { size, map } = require('lodash');

const { criteriaBuilder } = require('../../../common/dataController');

const getSummary = async (req, res) => {
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    let { filterBy } = req.query;
    let modelName = mongoose.models["Employee"];

    if (Object.keys(sort).length === 0) {
        sort = { _id: 1 };
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };
        let stages = await getAggregateStages(filterBy);
        if (filter) {
            stages.push({
                $match: filter
            });
        }
        const aggregate = modelName.aggregate(stages);
        const summaryList = await modelName.aggregatePaginate(aggregate, options);
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

const getAggregateStages = async (filterBy) => {
    const subdepartment = await SubDepartment.findOne({ "formattedName": "sales" }).lean();
    const roles = await Role.find({ subDepartmentFormattedName: subdepartment.formattedName }).lean();
    const rolesMap = {};
    roles.forEach(role => rolesMap[role.formattedName] = role.formattedName);
    const rolesArray = map(roles, 'formattedName');

    let addFields = {
        isBdt: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "bdt"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isBdaT: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "bdat"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isBda: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "bda"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isBdtm: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "bdtm"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isTeamManager: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "team_manager"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isSeniorBdtm: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "senior_bdtm"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isSeniorManager: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "senior_manager"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isAvp: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "avp"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isHrbpLead: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "hrbp_lead"] }
                ]
            }, "$reporters.email", "$noval"]
        },
        isTeamHead: {
            "$cond": [{
                $and: [
                    { $eq: ["$reporters.role", "team_head"] }
                ]
            }, "$reporters.email", "$noval"]
        }
    }

    let group = {
        _id: "$_id",
        reporters: {
            $addToSet: "$reporters"
        },
        isBdt: { $addToSet: "$isBdt" },
        isBdaT: { $addToSet: "$isBdaT" },
        isBda: { $addToSet: "$isBda" },
        isBdtm: { $addToSet: "$isBdtm" },
        isTeamManager: { $addToSet: "$isTeamManager" },
        isSeniorBdtm: { $addToSet: "$isSeniorBdtm" },
        isSeniorManager: { $addToSet: "$isSeniorManager" },
        isAvp: { $addToSet: "$isAvp" },
        isHrbpLead: { $addToSet: "$isHrbpLead" },
        isTeamHead: { $addToSet: "$isTeamHead" },
    }

    let addFieldsCounts = {
        email: "$originalUser.email",
        role: "$originalUser.role",
        bdtCount: { $size: "$isBdt" },
        bdaTCount: { $size: "$isBdaT" },
        bdaCount: { $size: "$isBda" },
        bdtmCount: { $size: "$isBdtm" },
        tmCount: { $size: "$isTeamManager" },
        smCount: { $size: "$isSeniorManager" },
        seniorBdtmCount: { $size: "$isSeniorBdtm" },
        avpCount: { $size: "$isAvp" },
        HrbpLeadCount: { $size: "$isHrbpLead" },
        thCount: { $size: "$isTeamHead" },
        totalReportersCount: {
            $size: "$reporters"
        }
    }

    addFields["isAgm"] = {
        "$cond": [{
            $and: [
                { $eq: ["$reporters.role", "agm"] }
            ]
        }, "$reporters.email", "$noval"]
    };

    addFields["isGm"] = {
        "$cond": [{
            $and: [
                { $eq: ["$reporters.role", "gm"] }
            ]
        }, "$reporters.email", "$noval"]
    };

    group["isAgm"] = { $addToSet: "$isAgm" };
    group["isGm"] = { $addToSet: "$isGm" };

    addFieldsCounts["agmCount"] = { $size: "$isAgm" };
    addFieldsCounts["gmCount"] = { $size: "$isGm" };

    return [{
        $match: {
            "role": {
                $in: rolesArray
            },
            "status": {
                $nin: ["Left", "left", "", null]
            }
        }
    }, {
        $unwind: {
            path: `$reportingTo.${filterBy}`,
            includeArrayIndex: 'reportingToIndex',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $group: {
            _id: `$reportingTo.${filterBy}.userEmail`,
            reporters: {
                $addToSet: {
                    email: "$email",
                    role: "$role"
                }
            }
        }
    }, {
        $unwind: {
            path: "$reporters"
        }
    }, {
        $addFields: addFields
    }, {
        $group: group
    }, {
        $lookup: {
            from: 'employees',
            localField: '_id',
            foreignField: 'email',
            as: 'originalUser'
        }
    }, {
        $unwind: {
            path: "$originalUser",
            preserveNullAndEmptyArrays: true
        }
    }, {
        $match: {
            "originalUser.status": { $nin: ["Left", "left"] },
            "originalUser.email": { $nin: ["", null] },
            "originalUser.role": rolesMap[filterBy]
        }
    }, {
        $addFields: addFieldsCounts
    }];
}

module.exports = {
    getSummary
}
