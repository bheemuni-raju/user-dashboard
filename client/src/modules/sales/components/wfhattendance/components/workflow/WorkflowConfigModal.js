import React, { useState } from 'react';
import { get } from 'lodash';
import moment from 'moment';

import ModalWindow from 'components/modalWindow';
import { FormBuilder, Checkbox } from 'components/form';
import { callApi } from 'store/middleware/api';

import wfhAttendanceImage from 'assets/attendance/wfh-attendance.png';

const WorkflowConfigModal = (props) => {
    const attendanceDate = get(props, 'workflowData.date');
    const workflowData = get(props, 'workflowData', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    let editFormRef = "";

    const updateWorkflowStatus = () => {
        const formValues = editFormRef && editFormRef.validateFormAndGetValues();
        formValues.meetingAttendanceStartingAt = getUTCDate(formValues.meetingAttendanceStartingAt, true);
        formValues.meetingAttendanceLockingAt = getUTCDate(formValues.meetingAttendanceLockingAt, true);
        formValues.uploadTalktimeStartingAt = getUTCDate(formValues.uploadTalktimeStartingAt, true);
        formValues.uploadTalktimeLockingAt = getUTCDate(formValues.uploadTalktimeLockingAt, true);
        formValues.managerDisputeStartingAt = getUTCDate(formValues.managerDisputeStartingAt, true);
        formValues.managerDisputeLockingAt = getUTCDate(formValues.managerDisputeLockingAt, true);
        formValues.bdaDisputeStartingAt = getUTCDate(formValues.bdaDisputeStartingAt, true);
        formValues.bdaDisputeLockingAt = getUTCDate(formValues.bdaDisputeLockingAt, true);
        formValues.finalAttendanceLockingAt = getUTCDate(formValues.finalAttendanceLockingAt, true);
       
        delete formValues.forSystemAttendance;
        delete formValues.forDisputeRaising;

        setLoading(true);
        callApi(`/usermanagement/wfhattendanceworkflow/updateStatus`, 'POST', {
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
        name: 'bdaDisputeStartingAt',
        label: 'BDA Dispute Starting At',
        disabled: new Date(workflowData.bdaDisputeStartingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'bdaDisputeLockingAt',
        label: 'BDA Dispute Locking At',
        disabled: new Date(workflowData.bdaDisputeLockingAt) < new Date()
    }, {
        type: 'reactDate',
        name: 'finalAttendanceLockingAt',
        label: 'Final Attendace Locking At',
        disabled: new Date(workflowData.finalAttendanceLockingAt) < new Date()
     }
]

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
                    bdaDisputeStartingAt: getUTCDate(workflowData.bdaDisputeStartingAt),
                    bdaDisputeLockingAt: getUTCDate(workflowData.bdaDisputeLockingAt),
                    finalAttendanceLockingAt: getUTCDate(workflowData.finalAttendanceLockingAt),
                }}
                cols={2}
            />

        </ModalWindow>)
}

export default WorkflowConfigModal;