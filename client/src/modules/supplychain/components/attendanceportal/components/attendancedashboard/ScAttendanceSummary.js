import React, { useState } from 'react';
import { Alert } from 'reactstrap';

import { BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

const AttendanceSummary = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getColumns = () => {
        const columns = [{
            dataField: "_id.date",
            text: "Date",
            width: 100
        }, {
            dataField: 'total',
            text: 'Total',
            width: 100
        }, {
            dataField: 'totalPresent',
            text: 'Present',
            width: 100
        }, {
            dataField: 'totalAbsent',
            text: 'Absent',
            width: 100
        }, {
            dataField: 'totalLeave',
            text: 'Leave',
            width: 100
        }, {
            dataField: 'totalReportingManagerRequestRaised',
            text: 'Manager Request',
            width: 120
        }, {
            dataField: 'totalAgentRequestRaised',
            text: 'Agent Request',
            width: 100
        }, {
            dataField: 'totalRequestApproved',
            text: 'Approved',
            width: 100
        }, {
            dataField: 'totalRequestRejected',
            text: 'Rejected',
            width: 100
        }, {
            dataField: 'totalRequestPending',
            text: 'Pending',
            width: 100
        }];

        return columns;
    }

    const columns = getColumns();

    return (
            <BoxBody loading={loading} error={error} >
                <Alert color="info">
                    Present - Total Present,
                    Absent - Total Absent,
                    Leave - Total Leave,
                    Manager Request - Total Reporting Manager Request,
                    Agent Request - Total Agent Request Raised,
                    Approved - Total Request Approved,
                    Rejected - Total Request Rejected,
                    Pending - Total Request Pending
            </Alert>
                <ByjusGrid
                    gridDataUrl={`/usermanagement/supplychain/attendance/summary`}
                    columns={columns}
                />
            </BoxBody>
    )
}

export default AttendanceSummary;
