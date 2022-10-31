const { get, size, isEmpty, sortBy, flattenDeep, find, isEqual, transform, isObject, toLower } = require('lodash');
const moment = require('moment');
const AWS = require("aws-sdk");

const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const { EmployeeSnapshot, Employee, Role } = require('@byjus-orders/nexemplum/ums');
const { RevenueCycle, Job } = require('@byjus-orders/nexemplum/oms');
const { getAggregateStages } = require('./employeeSummaryController');
const config = require("../../../config");
const { getCohort } = require("../../../lib/utils");

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, contextCriterias = [], searchCriterias = [], select } = req.body;
    let { filterBy } = req.query;

    if (!find(contextCriterias, { selectedColumn: 'cycle_name' }) && filterBy !== "All") {
        contextCriterias.push({
            selectedColumn: 'cycle_name',
            selectedOperator: 'in',
            selectedValue: [filterBy]
        })
    }

    if(!isEmpty(searchCriterias)){
        if(searchCriterias.searchBuilder[0].selectedColumn === "tnl_id"){
            searchCriterias.searchBuilder[0].selectedValue = toLower(searchCriterias.searchBuilder[0].selectedValue);
        }
    }

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        };

        const list = await EmployeeSnapshot.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const getCycle = async (req, res) => {
    const { cycleType = "bimonthly" } = req.body;
    const cycleList = await RevenueCycle.find({ cycleType }).sort({ "cycleName": -1 });
    cycleList.push({ "cycleName": "All" });
    res.json(cycleList);
};

const getSnapshotSummary = async (req, res) => {
    let { page, limit, sort } = req.body;
    let { cycleId } = req.query;

    if (Object.keys(sort).length === 0) {
        sort = {
            _id: "desc"
        };
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };
        const stages = await getAggregateStages(cycleId);
        const aggregate = EmployeeSnapshot.aggregate(stages);
        const summaryList = await EmployeeSnapshot.aggregatePaginate(aggregate, options);
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

const updateEmployeeSnapshot = async (req, res) => {

    try {
        const { cycle_name } = req.query;
        const updatedRecords = req.body;
        const { isChecked } = updatedRecords;
        const reason = updatedRecords.reason;
        delete updatedRecords.reason;
        let reportingTo = {};
        let reportingManagerRole, reportingManagerDetails = "";
        const records = await EmployeeSnapshot.findOne(
            {
                cycle_name,
                employee_email: updatedRecords.employee_email
            });
        const workflowhistory = difference(updatedRecords, records);
        delete workflowhistory['isChecked'];  
        const updateUmsRecords = {...workflowhistory};

        for (let key in workflowhistory) {
            workflowhistory[key] = {
                "oldValue": records[key],
                "newValue": workflowhistory[key]
            }
        }

        let managerDetails = {
            history: [{
                changes: workflowhistory,
                updatedBy: req.user ? get(req.user, 'email') : 'api',
                updatedAt: new Date(),
                reason
            }]}
       
            if(Object.keys(updateUmsRecords).includes('reporting_manager_email')){
                const employee = await Employee.findOne({
                    email: updatedRecords.reporting_manager_email
                });
                const { 
                    name: reporting_manager_name = "",
                    tnlId: reporting_manager_tnl_id = "",
                    role: reporting_manager_role = "",
                    email: reporting_manager_email = "",
                } = employee || {};

                reportingManagerRole = reporting_manager_role;
                updatedRecords['reporting_manager_name'] = reporting_manager_name;
                updatedRecords['reporting_manager_tnl_id'] = reporting_manager_tnl_id;
                updatedRecords['reporting_manager_role'] = reporting_manager_role;
                updatedRecords['reporting_manager_email'] = reporting_manager_email;

                const roles = await Role.findOne({"formattedName":reporting_manager_role});
                const { level } = roles;
                const reportingStatus = {
                    "userEmail": reporting_manager_email,
                    "userType": "PRIMARY",
                    "level": level
                }
                reportingManagerDetails = reportingStatus;
                reportingTo = {
                    [reporting_manager_role] : reportingStatus
                }
                managerDetails[`reportingTo.${reportingManagerRole}`] = reportingManagerDetails;
            }

            if (isChecked && !Object.keys(updateUmsRecords).includes("reporting_manager_email") &&
            !Object.keys(updateUmsRecords).includes("reporting_manager_role")) {
            const updateEmployeeRecords = await Employee.updateOne(
                {
                    email: updatedRecords.employee_email
                },
                {
                    $set: {
                        ...updateUmsRecords,
                        updatedBy: req.user ? get(req.user, 'email') : 'api',
                    },
                    $addToSet: managerDetails
                }
            );
        }
    
        const updateEmployeeRecords = await EmployeeSnapshot.updateOne(
            {
                cycle_name,
                employee_email: updatedRecords.employee_email
            },
            {
                $set: {
                    ...updatedRecords,
                    updatedBy: req.user ? get(req.user, 'email') : 'api',
                    updatedAt: new Date()
                },
                $addToSet: managerDetails
            });

        const updateSnapshotFlags = await RevenueCycle.updateOne({
            cycleName: cycle_name
        },
            {
                $set:
                {
                    "employeeSnapshotWorkflow.status": 'modified',
                    "employeeSnapshotWorkflow.snapshotModifiedAt": new Date(),
                    "employeeSnapshotWorkflow.updatedAt": new Date(),
                    "employeeSnapshotWorkflow.updatedBy": get(req.user, 'email')
                }
            })

        res.status(200).json(
            { message: "Successfully updated employee snapshot record." }
        );
    } catch (error) {
        return res.status(500).json({ message: 'Update is failed' });
    }
};

const bulkUpdateEmployeeSnapshot = async (req, res) => {

    try {
        const updatedRecords = req.body;
        const { cycle_name } = req.query;
        const { isChecked } = updatedRecords;
        const field = updatedRecords['field'];
        const employeesCount = updatedRecords.employeeEmails.length;
        const updateEmployee = updatedRecords[field];
        const reason = updatedRecords.reason;
        let employeeRecords = {};
        let reportingTo = {};
        let reportingManagerRole, reportingManagerDetails = "";

        if(field === 'reporting_manager_email'){
            const employee = await Employee.findOne({
                email: updatedRecords.reporting_manager_email
            });
            const { 
                name: reporting_manager_name = "",
                tnlId: reporting_manager_tnl_id = "",
                role: reporting_manager_role = "",
                email: reporting_manager_email = "",
            } = employee || {};

            reportingManagerRole = reporting_manager_role;
            employeeRecords['reporting_manager_name'] = reporting_manager_name;
            employeeRecords['reporting_manager_tnl_id'] = reporting_manager_tnl_id;
            employeeRecords['reporting_manager_role'] = reporting_manager_role;
            employeeRecords['reporting_manager_email'] = reporting_manager_email;

            const roles = await Role.findOne({"formattedName":reporting_manager_role});
            const { level } = roles;
            const reportingStatus = {
                "userEmail": reporting_manager_email,
                "userType": "PRIMARY",
                "level": level
            }
            reportingManagerDetails = reportingStatus;
            reportingTo = {
                [reporting_manager_role] : reportingStatus
            }
        }
        for (let i = 0; i < employeesCount; i++) {
            const records = await EmployeeSnapshot.findOne(
                {
                    cycle_name,
                    employee_email: updatedRecords.employeeEmails[i]
                });

            const updatedField = updatedRecords.field;
            const updateHistory = {
                [updatedField]: {
                    "oldValue": records[field],
                    "newValue": updateEmployee
                }
            };

            if (records[field] !== updateEmployee) {
                let managerDetails = {
                    history: [{
                        changes: updateHistory,
                        updatedBy: req.user ? get(req.user, 'email') : 'api',
                        updatedAt: new Date(),
                        reason
                    }]};

                if(field == "reporting_manager_email"){
                    managerDetails[`reportingTo.${reportingManagerRole}`] = reportingManagerDetails;
                }

                if (isChecked && (field !== 'reporting_manager_email')) {
                    const updateEmployeeRecords = await Employee.updateOne(
                        {
                            email: updatedRecords.employeeEmails[i]
                        },
                        {
                            $set: {
                                [field]: updateEmployee,
                                updatedBy: req.user ? get(req.user, 'email') : 'api',
                            },
                            $addToSet: managerDetails
                        });
                }

                const updateEmployeeRecords = await EmployeeSnapshot.updateOne(
                    {
                        cycle_name,
                        employee_email: updatedRecords.employeeEmails[i]
                    },
                    {
                        $set: {
                            ...employeeRecords,
                            [field]: updateEmployee,
                            updatedBy: req.user ? get(req.user, 'email') : 'api',
                            updatedAt: new Date()
                        },
                        $addToSet: managerDetails
                    });
            }
        }

        const updateSnapshotFlags = await RevenueCycle.updateOne({
            cycleName: cycle_name,
        },
            {
                $set:
                {
                    "employeeSnapshotWorkflow.status": 'modified',
                    "employeeSnapshotWorkflow.snapshotModifiedAt": new Date(),
                    "employeeSnapshotWorkflow.updatedAt": new Date(),
                    "employeeSnapshotWorkflow.updatedBy": get(req.user, 'email')
                }
            })
        res.status(200).json({ message: `${employeesCount} Employee Snapshot record Successfully updated.` }
        );

    } catch (error) {
        return res.status(500).json({ message: 'Update is failed' });
    }
};

const getSnapshotWorkflow = async (req, res) => {
    let { page, limit, sort, filter = {}, contextCriterias = [], searchCriterias = [] } = req.body;
    const { filterBy } = req.query;

    if(!Object.keys(sort).includes("cycleEnd")){
        const sortKey = Object.keys(sort);
        const sortValue = Object.values(sort);
        sort = {};
        sort[`employeeSnapshotWorkflow.${sortKey[0]}`] = sortValue[0];
    }
    
    if (!find(contextCriterias, { selectedColumn: 'cycle_name' }) && filterBy !== "All") {
        contextCriterias.push({
            selectedColumn: 'cycleType',
            selectedOperator: 'in',
            selectedValue: filterBy
        })
    }
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort
        };
        const cycleList = await RevenueCycle.paginate(filter, options);
        res.json(cycleList);
    } catch (err) {
        return res.status(500).json({ message: 'failed' });
    }
}

const updateSnapshotWorkflow = async (req, res) => {
    const { cycleName } = req.body;

    try {
        const updateWorkflow = await RevenueCycle.updateOne({
            cycleName: cycleName
        }, {
            $set: {
                "employeeSnapshotWorkflow.status": "approved",
                "employeeSnapshotWorkflow.snapshotApprovedAt": new Date()
            }
        })
        res.status(200).json(
            { message: "Successfully updated." });
    } catch (error) {
        return res.status(500).json({ message: 'Update is failed' });
    }
}

const getWorkflowHistory = async (req, res) => {
    let { page, limit, sort, filter = {}, contextCriterias = [], searchCriterias = [] } = req.body;
    const { cycleName } = req.query;
    if (!find(contextCriterias, { selectedColumn: 'cycle_name' })) {
        contextCriterias.push({
            selectedColumn: 'cycle_name',
            selectedOperator: 'in',
            selectedValue: cycleName
        }, {
            selectedColumn: 'history',
            selectedOperator: 'exists'
        })
    }
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort
        };
        const cycleList = await EmployeeSnapshot.paginate(filter, options);
        res.json(cycleList);
    } catch (err) {
        return res.status(500).json({ message: 'failed' });
    }
}

const getNewUsersList = async (req, res) => {
    let { page, limit, sort, filter = {}, contextCriterias = [], searchCriterias = [] } = req.body;
    const { cycleName } = req.query;

    try {
        const cycleList = await RevenueCycle.findOne({ cycleName: cycleName });
        const { employeeSnapshotWorkflow } = cycleList;
        const snapshotTakenAt = get(employeeSnapshotWorkflow, 'snapshotTakenAt');
        const nextEmployeeSnapshotJob = moment(new Date(snapshotTakenAt)).add(7, 'days').format("YYYY-MM-DD H:mm:ss");

        if (contextCriterias.length === 0) {
            contextCriterias.push({
                selectedColumn: 'createdAt',
                selectedOperator: 'greater_than',
                selectedValue: snapshotTakenAt
            }, {
                selectedColumn: 'createdAt',
                selectedOperator: 'less_than',
                selectedValue: nextEmployeeSnapshotJob
            })
        }
        filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort
        };

        const employeeData = await Employee.paginate(filter, options);
        const docs = get(employeeData, 'docs');
        const emails = docs.map(ele => ele.email);
        const emailsList = [];

        for (let ele = 0; ele < emails.length; ele++) {
            const data = await EmployeeSnapshot.count({ employee_email: emails[ele] });
            if (data && data > 0) {
                emailsList.push(emails[ele]);
            }
        };

        const data = docs.filter(ele => {
            const val = emailsList.includes(ele.email);
            if (!val) {
                return ele;
            }
        });
        employeeData.docs = data;
        res.json(employeeData);
    } catch (err) {
        console.log("Error in generating response");
    }
}

const addNewSnapshotRecords = async (req, res) => {
    const { employee_email } = req.body;
    const { cycle_name } = req.query;
    try {
        const currRevenueData = await RevenueCycle.findOne({ "cycleName": cycle_name });
        const { cycleStart, cycleEnd } = currRevenueData;
        const employeeData = await Employee.find({
            email: { $in: employee_email }
        }, (function (err, docs) {
            docs.map((ele) => {
                return ele;
            });
        }));
        console.log("Total sales employees ", employeeData.length);

        let employeeSnapshotData = [];
        for (let idx = 0; idx < employeeData.length; idx++) {
            const reportingTo = employeeData[idx].reportingTo;
            const reportingValues = reportingTo && Object.values(reportingTo);
            const reportingHierarchySorted = sortBy(flattenDeep(reportingValues), "level");
            const reportingManagerEmail = get(reportingHierarchySorted, "0.userEmail");
            const reportingManagerData = await Employee.findOne({ email: reportingManagerEmail });

            let { doj = "", tnlId = "", email = "", name = "", status = "", vertical = "", campaign = "", location = "", unit = "", role = "" } = employeeData[idx];

            if (["bda", "bdat"].includes(role) && doj) {
                const cycleEndDate = moment(cycleEnd);
                const dateOfJoining = moment(doj);
                const differenceInDays = cycleEndDate.diff(dateOfJoining, 'days');

                if (differenceInDays > 365) {
                    role = "senior_bda";
                }
            }

            let employeeSnapshot = {};
            employeeSnapshot["cycle_name"] = cycle_name;
            employeeSnapshot["role"] = role;
            employeeSnapshot["tnl_id"] = tnlId.toLowerCase();
            employeeSnapshot["employee_email"] = email.toLowerCase();
            employeeSnapshot["employee_name"] = name;
            employeeSnapshot["status"] = status;
            employeeSnapshot["vertical"] = vertical;
            employeeSnapshot["campaign"] = campaign;
            employeeSnapshot["location"] = location;
            employeeSnapshot["unit"] = unit;
            employeeSnapshot["reporting_manager_name"] = get(reportingManagerData, "name", "");
            employeeSnapshot["reporting_manager_email"] = get(reportingManagerData, "email", "");
            employeeSnapshot["reporting_manager_tnl_id"] = get(reportingManagerData, "tnlId", "");
            employeeSnapshot["reporting_manager_role"] = get(reportingManagerData, "role", "");
            employeeSnapshot["source"] = "ums_screen";
            employeeSnapshot["cohortId"] = getCohort(cycleStart, doj, role);
            employeeSnapshot['reportingTo'] = reportingTo;
            employeeSnapshotData.push(employeeSnapshot);
        }

        // Create Snapshots
        const result = await EmployeeSnapshot.insertMany(employeeSnapshotData);
        await RevenueCycle.updateOne({
            cycleName: cycle_name
        },
            {
                $set:
                {
                    "employeeSnapshotWorkflow.status": 'modified',
                    "employeeSnapshotWorkflow.snapshotModifiedAt": new Date(),
                    "employeeSnapshotWorkflow.updatedAt": new Date(),
                    "employeeSnapshotWorkflow.updatedBy": get(req.user, 'email')
                }
            })
        console.log("Employee snapshots created successfully")
        res.status(200).json(
            { message: "Successfully updated." });
    } catch (err) {
        return res.status(500).json({ message: 'failed' });
    }
}

const difference = (object, base) => {
    function changes(object, base) {
        return transform(object, function (result, value, key) {
            if (!isEqual(value, base[key])) {
                result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(object, base);
}

const downloadReport = async (req, res) => {
    const { cycleName } = req.body;
    const { email } = req.user;

    const environmentVars = [
        { name: "JOB_TYPE", value: "employeeSnapshot" },
        { name: "CYCLE_NAME", value: cycleName },
        { name: "SCHEDULED_BY", value: email },
    ];

    const jobParams = {
        jobName: "employee_snapshot",
        jobDefinitionName: "achieve-analytics-job",
        jobQueue: "achieve-job-queue",
        environmentVars
    };

    const result = await submitJob(
        jobParams.jobName,
        jobParams.jobQueue,
        jobParams.jobDefinitionName,
        environmentVars
    );

    const newJob = new Job({
        jobName: "employee_snapshot",
        jobId: result.data.jobId,
        jobDefinition: "achieve-analytics-job",
        jobParams: environmentVars
    });

    const savedJob = await newJob.save();
    return res.status(200).json({ message: "success" });
};

//In future, if used on multiple places, will move it to utility
const submitJob = async (jobName, jobQueue, jobDefinition, environment) => {
    AWS.config.update({
        accessKeyId: config.awsBatch.accessKeyId,
        secretAccessKey: config.awsBatch.secretAccessKey,
        region: "ap-south-1"
    });

    AWS.config.setPromisesDependency(Promise);
    const batch = new AWS.Batch();

    const params = {
        jobName,
        jobQueue,
        jobDefinition,
        containerOverrides: {
            environment
        }
    }
    return new Promise((resolve, reject) => {
        batch.submitJob(params, (err, data) => {
            if (err) return reject(err);
            return resolve({ data })
        });
    });
}

module.exports = {
    listData,
    getCycle,
    getSnapshotSummary,
    updateEmployeeSnapshot,
    bulkUpdateEmployeeSnapshot,
    getSnapshotWorkflow,
    updateSnapshotWorkflow,
    getWorkflowHistory,
    downloadReport,
    getNewUsersList,
    addNewSnapshotRecords,
}
