import React, { Component, useState } from 'react';
import { get } from 'lodash';
import moment from 'moment';
import { connect } from 'react-redux';
import { Alert } from "reactstrap";

import ModalWindow from 'components/modalWindow';
import { Checkbox } from 'components/form';
import { callApi } from 'store/middleware/api';

const WorkflowMoveStageModal = (props) => {
    const { user } = props;
    const attendanceDate = get(props, 'workflowData.date');
    const workflowData = get(props, 'workflowData', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [talktimeUploadStatus, setTalktimeUploadStatus] = useState(false);
    const [demoSessionsUploadStatus, setDemoSessionsUploadStatus] = useState(false);

    const moveWorkflowStage = () => {
        setLoading(true);
        callApi(`/usermanagement/wfhattendanceworkflow/updateTalktimeStatus`, 'POST', {
            date: workflowData.date,
            talktimeUploadStatus,
            demoSessionsUploadStatus
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

    const onChangeTalktimeUpload = (event) => {
        const { checked } = event.target;
        setTalktimeUploadStatus(checked);
    }
    const onChangeDemoSessionsUpload = (event) => {
        const { checked } = event.target;
        setDemoSessionsUploadStatus(checked);
    }

    return (
        <ModalWindow
            heading={`${moment(attendanceDate).format('DD-MM-YYYY')} - Enable Manage Dispute`}
            closeModal={props.closeModal}
            showModal={true}
            addOkCancelButtons={true}
            okText="Enable Manager Dispute"
            loading={loading}
            error={error}
            onClickOk={moveWorkflowStage}
            size="lg"
        >
            <Alert color="warning">
                Please confirm the details of talktime(Ameyo web/ Ameyo ivr/Knowlarity web) and zoom demo sessions for the previous day is uploaded. <br /><br />
               Note - The System Attendance will be computed based on the uploaded talktime, Please ensure all the uploaded data is correct before enabling the manager dispute.
            </Alert>
            <Checkbox
                onChange={onChangeDemoSessionsUpload}
                name='update demo sessions status'
                checked={demoSessionsUploadStatus}
            >Upload demo sessions done ?</Checkbox>
            <Checkbox
                onChange={onChangeTalktimeUpload}
                name='update talktime status'
                checked={talktimeUploadStatus}
            >Upload talktime done ?</Checkbox>

        </ModalWindow>)
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(WorkflowMoveStageModal);
