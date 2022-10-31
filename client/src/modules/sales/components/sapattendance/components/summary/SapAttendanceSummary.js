import React, { useState } from 'react';
import { Alert } from 'reactstrap';

import { BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

const SapAttendanceSummary = (props) => {
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
            dataField: 'OD',
            text: 'OD',
            className: 'td-header-warning',
            width: 80
        }, {
            dataField: 'P',
            text: 'P',
            className: 'td-header-warning',
            width: 80
        }, {
            dataField: 'Other',
            text: 'Other',
            className: 'td-header-warning',
            width: 80
        }];

        return columns;
    }

    const columns = getColumns();

    return (
        <BoxBody loading={loading} error={error} >
            <Alert color="info">
                [P - Present]
                [OD - On Duty]
                [Other - Other than Present or On Duty]
            </Alert>
            <ByjusGrid
                gridDataUrl={`/usermanagement/attendance/summary`}
                modelName="SAPAttendance"
                gridTitle="SAP Attendance"
                columns={columns}
            />
        </BoxBody>
    )
}

export default SapAttendanceSummary;