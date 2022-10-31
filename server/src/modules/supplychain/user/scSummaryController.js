const mongoose = require('mongoose');
const { Role, SubDepartment } = require('@byjus-orders/nexemplum/ums');
const { size, map } = require('lodash');

const { criteriaBuilder } = require('../../../common/dataController');
const logger = require('@byjus-orders/byjus-logger').child({ module: 'scSummary'});

const getSummary = async (req, res) => {
    logger.info({method:"getSummary", requestObj: req.body}, "getSummary method initialized");

    try {

    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    let { filterBySubDept, filterByRole } = req.query;
    let modelName = mongoose.models["ScEmployee"];

    if (Object.keys(sort).length === 0) {
        sort = { _id: 1 };
    }
        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };
        let stages = await getAggregateStages(filterBySubDept, filterByRole);
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
        logger.error(error, "Error in fetching data from getSummary");
        throw new Error(error || 'Error in fetching data');
    }
}

const getAggregateStages = async (filterBySubDept, filterByRole) => {
    const subdepartment = await SubDepartment.findOne({ "formattedName": filterBySubDept }).lean();
    const roles = await Role.find({ departmentFormattedName: "supply_chain", subDepartmentFormattedName: subdepartment.formattedName }).lean();
    const rolesMap = {};
    roles.forEach(role => rolesMap[role.formattedName] = role.formattedName);
    const rolesArray = map(roles, 'formattedName');
    return [{
        $match: {
            "role": {
                $in: rolesArray
            },
            "status": {
                $nin: ["Exit", "exit", "", null]
            }
        }
    }, {
        $unwind: {
            path: `$reportingTo.${filterByRole}`,
            includeArrayIndex: 'reportingToIndex',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $group: {
            _id: `$reportingTo.${filterByRole}.userEmail`,
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
        $addFields: {
            isIntern: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "intern"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isOfficeAssistant: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "office_assistant"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isTrainee: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "trainee"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isExecutive: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "executive"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isSeniorExecutive: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "senior_executive"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isAssociate: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "associate"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isSeniorAssociate: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "senior_associate"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isTeamLead: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "team_lead"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isAssistantManager: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "assistant_manager"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isManager: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "manager"] }
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
            isAssistantGeneralManager: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "assistant_general_manager"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isGeneralManager: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "general_manager"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isAssistantVicePresident: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "assistant_vice_president"] }
                    ]
                }, "$reporters.email", "$noval"]
            },
            isVp: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reporters.role", "vp"] }
                    ]
                }, "$reporters.email", "$noval"]
            }
        }
    }, {
        $group: {
            _id: "$_id",
            reporters: {
                $addToSet: "$reporters"
            },
            isIntern: { $addToSet: "$isIntern" },
            isOfficeAssistant: { $addToSet: "$isOfficeAssistant" },
            isTrainee: { $addToSet: "$isTrainee" },
            isExecutive: { $addToSet: "$isExecutive" },
            isSeniorExecutive: { $addToSet: "$isSeniorExecutive" },
            isAssociate: { $addToSet: "$isAssociate" },
            isSeniorAssociate: { $addToSet: "$isSeniorAssociate" },
            isTeamLead: { $addToSet: "$isTeamLead" },
            isAssistantManager: { $addToSet: "$isAssistantManager" },
            isManager: { $addToSet: "$isManager" },
            isSeniorManager: { $addToSet: "$isSeniorManager" },
            isAssistantGeneralManager: { $addToSet: "$isAssistantGeneralManager" },
            isGeneralManager: { $addToSet: "$isGeneralManager" },
            isAssistantVicePresident: { $addToSet: "$isAssistantVicePresident" },
            isVp: { $addToSet: "$isVp" }
        }
    }, {
        $lookup: {
            from: 'ums_sc_employees',
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
            "originalUser.status": { $nin: ["Exit", "exit"] },
            "originalUser.subDepartment": { $in: [filterBySubDept] },
            "originalUser.email": { $nin: ["", null] },
            "originalUser.role": rolesMap[filterByRole]
        }
    }, {
        $addFields: {
            email: "$originalUser.email",
            role: "$originalUser.role",
            internCount: { $size: "$isIntern" },
            officeAssistantCount: { $size: "$isOfficeAssistant" },
            traineeCount: { $size: "$isTrainee" },
            executiveCount: { $size: "$isExecutive" },
            seniorExecutiveCount: { $size: "$isSeniorExecutive" },
            associateCount: { $size: "$isAssociate" },
            seniorAssociateCount: { $size: "$isSeniorAssociate" },
            teamLeadCount: { $size: "$isTeamLead" },
            assistantManagerCount: { $size: "$isAssistantManager" },
            managerCount: { $size: "$isManager" },
            seniorManagerCount: { $size: "$isSeniorManager" },
            assistantGeneralManagerCount: { $size: "$isAssistantGeneralManager" },
            generalManagerCount: { $size: "$isGeneralManager" },
            assistantVicePresidentCount: { $size: "$isAssistantVicePresident" },
            isVp: { $size: "$isVp" },
            totalReportersCount: {
                $size: "$reporters"
            }
        }
    }];
}

module.exports = {
    getSummary
}
