import React, { useState } from 'react';
import { get } from 'lodash';
import moment from 'moment';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { TALKTIME_ELIGIBILITY } from 'config/wfhTalktime';

const WorkflowTalktimeConfigModal = (props) => {
    const attendanceDate = get(props, 'workflowData.date');
    const workflowData = get(props, 'workflowData', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    let editFormRef = "";
    const updateWorkflowStatus = () => {
        const formValues = editFormRef && editFormRef.validateFormAndGetValues();

        formValues.talktimeEligibility = {
            forSystemAttendance: formValues.forSystemAttendance,
            forDisputeRaising: formValues.forDisputeRaising,
            forPreSalesSystemAttendance: formValues.forPreSalesSystemAttendance,
            forPreSalesDisputeRaising: formValues.forPreSalesDisputeRaising
        }

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
        type: 'number',
        name: 'forSystemAttendance',
        label: 'Minimum Talktime For System Attendance (Sales)'
    }, {
        type: 'number',
        name: 'forDisputeRaising',
        label: 'Minimum Talktime For Dispute Raising (Sales)'
    }, {
        type: 'number',
        name: 'forPreSalesSystemAttendance',
        label: 'Minimum Talktime For System Attendance (Pre Sales)'
    }, {
        type: 'number',
        name: 'forPreSalesDisputeRaising',
        label: 'Minimum Talktime For Dispute Raising  (Pre Sales)'
    },]

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
            heading={`${moment(attendanceDate).format('DD-MM-YYYY')} -Attendance Configuration Workflow`}
            closeModal={props.closeModal}
            showModal={true}
            addOkCancelButtons={true}
            okText="Update"
            loading={loading}
            error={error}
            onClickOk={updateWorkflowStatus}
            size="lg"
            style={{ marginTop: "150px" }}
        >
            {
                <FormBuilder
                    fields={fields}
                    ref={(element) => editFormRef = element}
                    initialValues={{
                        forSystemAttendance: workflowData.talktimeEligibility ? workflowData.talktimeEligibility.forSystemAttendance : TALKTIME_ELIGIBILITY.MINIMUM_TALKTIME_FOR_SYSTEM_ATTENDANCE,
                        forDisputeRaising: workflowData.talktimeEligibility ? workflowData.talktimeEligibility.forDisputeRaising : TALKTIME_ELIGIBILITY.MINIMUM_TALKTIME_FOR_BDA_DISPUTE_RAISING,
                        forPreSalesSystemAttendance: workflowData.talktimeEligibility ? workflowData.talktimeEligibility.forPreSalesSystemAttendance : TALKTIME_ELIGIBILITY.MINIMUM_TALKTIME_FOR_SYSTEM_ATTENDANCE,
                        forPreSalesDisputeRaising: workflowData.talktimeEligibility ? workflowData.talktimeEligibility.forPreSalesDisputeRaising : TALKTIME_ELIGIBILITY.MINIMUM_TALKTIME_FOR_BDA_DISPUTE_RAISING,
                        bdtTrainingEndDate: getUTCDate(workflowData.bdtTrainingEndDate),
                        preSalesTrainingEndDate: getUTCDate(workflowData.preSalesTrainingEndDate),
                    }}
                    cols={2}
                />
            }
        </ModalWindow>
    )
}

export default WorkflowTalktimeConfigModal;
