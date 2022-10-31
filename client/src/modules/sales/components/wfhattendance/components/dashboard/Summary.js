import React, { useState } from 'react';
import { Alert } from 'reactstrap';

import { BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

const WfhSummary = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getColumns = () => {
        const columns = [{
            dataField: "_id.date",
            text: "Group By",
            className: 'td-header-info',
            width: 120
        }, {
            dataField: 'total',
            text: 'Total',
            width: 80
        }, {
            dataField: 'meetingYetToBeMarked',
            text: 'MYTBM',
            className: 'td-header-warning',
            width: 80
        }, {
            dataField: 'meetingMarked',
            text: 'MM',
            className: 'td-header-warning',
            width: 80
        }, {
            dataField: 'meetingNotMarked',
            text: 'MNM',
            className: 'td-header-warning',
            width: 80
        }, {
            dataField: 'meetingAttended',
            text: 'MAC',
            className: 'td-header-warning',
            width: 80
        }, {
            dataField: 'meetingNotAttended',
            className: 'td-header-warning',
            text: 'MNAC',
            width: 80
        }, {
            dataField: 'talktimeYetToBeUploaded',
            text: 'TYTBU',
            width: 80
        }, {
            dataField: 'talktimeUploaded',
            text: 'TU',
            width: 80
        },{
            dataField: 'tmOpenForDiscussion',
            text: 'TMOFD',
            className: 'td-header-info',
            width: 80
        },{
            dataField: 'tmRequestRaised',
            text: 'TMRR',
            className: 'td-header-info',
            width: 80
        },{
            dataField: 'tmRequestApproved',
            text: 'TMRA',
            className: 'td-header-info',
            width: 80
        },{
            dataField: 'tmRequestRejected',
            text: 'TMRRJ',
            className: 'td-header-info',
            width: 80
        },{
            dataField: 'spOpenForDiscussion',
            text: 'SPOFD',
            className: 'td-header-warning',
            width: 80
        },{
            dataField: 'spRequestRaised',
            text: 'SPRR',
            className: 'td-header-warning',
            width: 80
        },{
            dataField: 'spRequestApproved',
            text: 'SPRA',
            className: 'td-header-warning',
            width: 80
        },{
            dataField: 'tmRequestRejected',
            text: 'SPRRJ',
            className: 'td-header-warning',
            width: 80
        }];

        return columns;
    }

    const columns = getColumns();

    return (
        <BoxBody loading={loading} error={error} >
            <Alert color="info">
                MYTBM - Meeting Yet To Be Marked
                MM - Meeting Marked
                MNM - Meeting Not Marked
                MA - Meeting Attended Count
                MNA - Meeting Not Attended Count
                TYTBU - Talktime Yet To Be Uploaded
                TU - Talktime Uploaded
                TMOFD - TM Open For Discussion
                TMRR - TM Request Raised
                TMRA - TM Request Approved
                TMRRJ - TM Request Rejected
                SPOFD - SP Open For Discussion
                SPRR - SP Request Raised
                SPRA - SP Request Approved
                SPRRJ - SP Request Rejected                
            </Alert>
            <ByjusGrid
                gridDataUrl={`/usermanagement/wfhattendance/summary`}
                columns={columns}
            />
        </BoxBody>
    )
}

export default WfhSummary;
