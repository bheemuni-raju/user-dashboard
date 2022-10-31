const { size, get, unionBy } = require('lodash');
const moment = require('moment');

const { Batch } = require('@byjus-orders/tyrion-plugins');
const { AttendanceWorkflow } = require('@byjus-orders/nexemplum/scachieve');

const config = require('../../../config');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");

Batch.init(
    config.awsBatch.accessKeyId,
    config.awsBatch.secretAccessKey
);

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort: sort || { date: -1 },
            populate,
            select
        }
        const list = await AttendanceWorkflow.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const updateWorkflowStatus = async (req, res) => {
    const { date } = req.body;

    const data = await AttendanceWorkflow.findOneAndUpdate({ date }, {
        "$set": {
            ...req.body,
            updatedAt: moment().toDate(),
            updatedBy: get(req, 'user.email', '')
        }
    });

    return res.json({ message: `Workflow status updated successfully`, data });
}

const moveWorkflowStage = async (req, res) => {
    const { date, currentStage, nextStage } = req.body;
    const batchSteps = [
        "meeting_attendance_marking_completed",
        "manager_dispute_open",
        "manager_dispute_completed",
        "bda_dispute_open",
        "bda_dispute_completed"
    ];
    let updateKey = "";

    if (nextStage.includes("meeting_attendance")) {
        updateKey = "meetingAttendanceStatus";
    }
    else if (nextStage.includes("talktime")) {
        updateKey = "uploadTalktimeStatus";
    }
    else if (nextStage.includes("manager")) {
        updateKey = "managerDisputeStatus";
    }
    else if (nextStage.includes("bda")) {
        updateKey = "bdaDisputeStatus";
    }

    if (batchSteps.includes(nextStage)) {
        const environmentVars = [{
            name: "WORKFLOW_ACTION",
            value: nextStage
        }, {
            name: "WORKFLOW_DATE",
            value: date
        }];

        await Batch.submitJob({
            jobName: `scachieve-attendance_${date}_${nextStage}`,
            jobQueue: "achieve-job-queue",
            jobDefinition: "scachieve-attendance-worker-job",
            environmentVars: environmentVars
        });
        await AttendanceWorkflow.findOneAndUpdate({ date }, {
            "$set": {
                [updateKey]: "in_progress",
                overAllWorkflowStatus: "in_progress",
                updatedAt: new Date(),
                updatedBy: get(req, 'user.email', '')
            }
        });
    }
    else {
        await AttendanceWorkflow.findOneAndUpdate({ date }, {
            "$set": {
                [updateKey]: nextStage,
                overAllWorkflowStatus: nextStage,
                updatedAt: new Date(),
                updatedBy: get(req, 'user.email', '')
            }
        });
    }
    return res.json({ message: `Workflow status updated successfully` });
}

const getWorkflowDetail = async (req, res) => {
    const { date } = req.body;

    const details = await AttendanceWorkflow.findOne({ date });

    return res.json(details);
}

module.exports = {
    ...commonController,
    listData,
    updateWorkflowStatus,
    moveWorkflowStage,
    getWorkflowDetail
}
