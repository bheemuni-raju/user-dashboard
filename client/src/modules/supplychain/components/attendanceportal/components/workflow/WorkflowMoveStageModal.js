import React, { Component, useState } from 'react';
import { get } from 'lodash';
import moment from 'moment';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const stageMap = {
    "workflow_started": 1,
    "seeding_open": 2,
    "seeding_completed": 3,
    "meeting_attendance_marking_open": 4,
    "meeting_attendance_marking_completed": 5,
    "upload_talktime_open": 6,
    "upload_talktime_completed": 7,
    "manager_dispute_open": 8,
    "manager_dispute_completed": 9,
    "agent_dispute_open": 10,
    "agent_dispute_completed": 11,
    "workflow_completed": 12
};

const computeCurrentAndNextStage = (workflowData) => {
    const { overAllWorkflowStatus } = workflowData;
    const currentStageValue = stageMap[overAllWorkflowStatus];
    const stageKeys = Object.keys(stageMap);
    const nextStage = stageKeys[currentStageValue];

    return {
        currentStage: overAllWorkflowStatus,
        nextStage: nextStage
    };
}

const WorkflowMoveStageModal = (props) => {
    const attendanceDate = get(props, 'workflowData.date');
    const workflowData = get(props, 'workflowData', {});
    const { currentStage, nextStage } = computeCurrentAndNextStage(workflowData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    let formRef = "";

    const moveWorkflowStage = () => {
        const formValues = formRef && formRef.validateFormAndGetValues();

        setLoading(true);
        callApi(`/usermanagement/supplychain/attendanceworkflow/moveWorkflowStage`, 'POST', {
            date: workflowData.date,
            ...formValues
        }, null, null, true)
            .then((response) => {
                setLoading(false);
                props.closeModal();
                props.byjusGridRef && props.byjusGridRef.onClickRefresh();
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const fields = [{
        type: 'text',
        name: 'currentStage',
        disabled: true,
        label: 'Current Stage'
    }, {
        type: 'text',
        name: 'nextStage',
        disabled: true,
        label: 'Next Stage'
    }];

    return (
        <ModalWindow
            heading={`${moment(attendanceDate).format('DD-MM-YYYY')} - Move Stage`}
            closeModal={props.closeModal}
            showModal={true}
            addOkCancelButtons={true}
            okText="Update"
            loading={loading}
            error={error}
            onClickOk={moveWorkflowStage}
            size="lg"
        >
            <FormBuilder
                fields={fields}
                initialValues={{
                    currentStage,
                    nextStage
                }}
                ref={(element) => formRef = element}
                cols={1}
            />

        </ModalWindow>)
}

export default WorkflowMoveStageModal;