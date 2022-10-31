import React, { Component, useState } from 'react';
import { get, isEmpty } from 'lodash';
import moment from 'moment';

import ModalWindow from 'components/modalWindow';
import { FormBuilder, Checkbox } from 'components/form';
import { callApi } from 'store/middleware/api';
import { TALKTIME_ELIGIBILITY } from 'config/wfhTalktime';

import wfhAttendanceImage from 'assets/attendance/wfh-attendance.png';

const WorkflowConfigModal = (props) => {
    const attendanceDate = get(props, 'workflowData.date');
    const workflowData = get(props, 'workflowData', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newBdtsOnBoarded, setNewBdtsOnboarded] = useState(false);

    let editFormRef = "";

    const updateWorkflowStatus = () => {
        const formValues = editFormRef && editFormRef.validateFormAndGetValues();
        formValues.meetingAttendanceStartingAt = getUTCDate(formValues.meetingAttendanceStartingAt, true);
        formValues.meetingAttendanceLockingAt = getUTCDate(formValues.meetingAttendanceLockingAt, true);
        formValues.uploadTalktimeStartingAt = getUTCDate(formValues.uploadTalktimeStartingAt, true);
        formValues.uploadTalktimeLockingAt = getUTCDate(formValues.uploadTalktimeLockingAt, true);
        formValues.managerDisputeStartingAt = getUTCDate(formValues.managerDisputeStartingAt, true);
        formValues.managerDisputeLockingAt = getUTCDate(formValues.managerDisputeLockingAt, true);
        formValues.agentDisputeStartingAt = getUTCDate(formValues.agentDisputeStartingAt, true);
        formValues.agentDisputeLockingAt = getUTCDate(formValues.agentDisputeLockingAt, true);
        formValues.finalAttendanceLockingAt = getUTCDate(formValues.finalAttendanceLockingAt, true);
        formValues.talktimeEligibility = {
            forSystemAttendance: formValues.forSystemAttendance,
            forDisputeRaising: formValues.forDisputeRaising
        }
        if (newBdtsOnBoarded) {
            formValues.bdtTrainingStatus = "initiated";
            formValues.bdtTrainingEndDate = getUTCDate(formValues.bdtTrainingEndDate, true);
            formValues.bdtTrainingStartDate = getUTCDate(attendanceDate, true);
        }
        delete formValues.forSystemAttendance;
        delete formValues.forDisputeRaising;

        setLoading(true);
        callApi(`/usermanagement/supplychain/attendanceworkflow/updateStatus`, 'POST', {
            date: workflowData.date,
            ...formValues
        }, null, null, true)
            .then((response) => {
                setLoading(false);
                props.byjusGridRef && props.byjusGridRef.onClickRefresh();
                props.closeModal();
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const onChangeNewBDTsJoining = (event) => {
        const { checked } = event.target;
        setNewBdtsOnboarded(checked);
    }

    const fields = [{
        type: 'reactDate',
        name: 'meetingAttendanceStartingAt',
        label: 'Meeting Attendance Starting At',
        disabled: new Date(workflowData.meetingAttendanceStartingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'meetingAttendanceLockingAt',
        label: 'Meeting Attendance Locking At',
        disabled: new Date(workflowData.meetingAttendanceLockingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'uploadTalktimeStartingAt',
        label: 'Upload Talktime Starting At',
        disabled: new Date(workflowData.uploadTalktimeStartingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'uploadTalktimeLockingAt',
        label: 'Upload Talktime Locking At',
        disabled: new Date(workflowData.uploadTalktimeLockingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'managerDisputeStartingAt',
        label: 'Manager Dispute Starting At',
        disabled: new Date(workflowData.managerDisputeStartingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'managerDisputeLockingAt',
        label: 'Manager Dispute Locking At',
        disabled: new Date(workflowData.managerDisputeLockingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'agentDisputeStartingAt',
        label: 'Agent Dispute Starting At',
        disabled: new Date(workflowData.agentDisputeStartingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'agentDisputeLockingAt',
        label: 'Agent Dispute Locking At',
        disabled: new Date(workflowData.agentDisputeLockingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'finalAttendanceLockingAt',
        label: 'Final Attendace Locking At',
        disabled: new Date(workflowData.finalAttendanceLockingAt) < new Date()
    }, {
        type: 'number',
        name: 'forSystemAttendance',
        label: 'Minimum Talktime For System Attendance (sec)'
    }, {
        type: 'number',
        name: 'forDisputeRaising',
        label: 'Minimum Talktime For Dispute Raising (sec)'
    }]

    if (workflowData.bdtTrainingStatus || newBdtsOnBoarded) {
        fields.push(
            {
                type: 'reactDate',
                name: 'bdtTrainingEndDate',
                label: 'BDTs Training End Date',
                disabled: new Date(workflowData.bdtTrainingEndDate) < new Date()
            }
        );
    }

    const getUTCDate = (dateString, addOffset) => {
        let date = dateString ? new Date(dateString) : new Date();
        if (!addOffset) {
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        } else {
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        }
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()))
    }
    return (
        <ModalWindow
            heading={`${moment(attendanceDate).format('DD-MM-YYYY')} - Configure Workflow`}
            closeModal={props.closeModal}
            showModal={true}
            addOkCancelButtons={true}
            okText="Update"
            loading={loading}
            error={error}
            onClickOk={updateWorkflowStatus}
            size="lg"
            image={wfhAttendanceImage}
        >
            <FormBuilder
                fields={fields}
                ref={(element) => editFormRef = element}
                initialValues={{
                    meetingAttendanceStartingAt: getUTCDate(workflowData.meetingAttendanceStartingAt),
                    meetingAttendanceLockingAt: getUTCDate(workflowData.meetingAttendanceLockingAt),
                    uploadTalktimeStartingAt: getUTCDate(workflowData.uploadTalktimeStartingAt),
                    uploadTalktimeLockingAt: getUTCDate(workflowData.uploadTalktimeLockingAt),
                    managerDisputeStartingAt: getUTCDate(workflowData.managerDisputeStartingAt),
                    managerDisputeLockingAt: getUTCDate(workflowData.managerDisputeLockingAt),
                    agentDisputeStartingAt: getUTCDate(workflowData.agentDisputeStartingAt),
                    agentDisputeLockingAt: getUTCDate(workflowData.agentDisputeLockingAt),
                    finalAttendanceLockingAt: getUTCDate(workflowData.finalAttendanceLockingAt),
                    bdtTrainingEndDate: getUTCDate(workflowData.bdtTrainingEndDate),
                    forSystemAttendance: workflowData.talktimeEligibility ? workflowData.talktimeEligibility.forSystemAttendance : TALKTIME_ELIGIBILITY.MINIMUM_TALKTIME_FOR_SYSTEM_ATTENDANCE,
                    forDisputeRaising: workflowData.talktimeEligibility ? workflowData.talktimeEligibility.forDisputeRaising : TALKTIME_ELIGIBILITY.MINIMUM_TALKTIME_FOR_AGENT_DISPUTE_RAISING,
                }}
                cols={2}
            />

            <Checkbox
                onChange={onChangeNewBDTsJoining}
                name='update_order'
                checked={!isEmpty(workflowData.bdtTrainingStatus) || newBdtsOnBoarded}
            >Is new BDTs onboarding day?</Checkbox>

        </ModalWindow>)
}

export default WorkflowConfigModal;