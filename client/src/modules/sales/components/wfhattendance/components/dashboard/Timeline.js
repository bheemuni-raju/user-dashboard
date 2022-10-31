
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Timeline, Alert } from 'antd';

import { callApi } from 'store/middleware/api';
import './timeline.scss';

const WfhTimeline = (props) => {
    const [date, setDate] = useState(props.date);
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState([]);

    useEffect(() => {
        getWorkflowDetails();
    }, []);

    useEffect(() => {
        setDate(props.date)
    }, [props.date])

    useEffect(() => {
        getWorkflowDetails();
    }, [date])

    const getWorkflowDetails = () => {
        setLoading(true);
        callApi(`/usermanagement/wfhattendanceworkflow/getDetails`, 'POST', { date }, null, null, true)
            .then((response) => {
                setLoading(false);
                setDetails(response);
            })
            .catch(error => {
                setLoading(false);
            })
    }

    const { seedingAt, uploadTalktimeAt, meetingMarkingLockingAt, managerDisputeLockingAt, bdaDisputeLockingAt } = details || {};

    return (
        <>
            <p className="text-gray mt-4">{""}</p>
            {details ?
                <Timeline mode="alternate">
                    <Timeline.Item color="green"><strong>Data Seeding</strong><br />{moment(seedingAt).utc().format('DD-MM-YYYY HH:mm:ss')} </Timeline.Item>
                    <Timeline.Item color="purple"><strong>Meeting Attendance Marking</strong><br />{moment(uploadTalktimeAt).utc().format('DD-MM-YYYY HH:mm:ss')} </Timeline.Item>
                    <Timeline.Item color="blue">< strong > Upload Talktime</strong><br />{moment(meetingMarkingLockingAt).utc().format('DD-MM-YYYY HH:mm:ss')} </Timeline.Item>
                    <Timeline.Item color="red">< strong > Manager Dispute Cycle</strong><br />{moment(managerDisputeLockingAt).utc().format('DD-MM-YYYY HH:mm:ss')} </Timeline.Item>
                    <Timeline.Item color="red">< strong > BDA Dispute Cycle</strong><br />{moment(bdaDisputeLockingAt).utc().format('DD-MM-YYYY HH:mm:ss')} </Timeline.Item>
                </Timeline> :
                <Alert type="success" message={`No Details Found for ${date}`} />}
        </>
    )
}

export default WfhTimeline;