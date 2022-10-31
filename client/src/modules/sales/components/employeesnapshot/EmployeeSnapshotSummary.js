import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import ByjusGrid from "modules/core/components/grid/ByjusGrid";
import { Box, BoxBody } from 'components/box';
import { cycleNameFormatter } from 'utils/componentUtil';

class EmployeeSnapshotSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    getColumns = () => {
        return [{
            dataField: '_id',
            text: 'Cycle Name',
            width: '300px',
            className: 'td-header-info',
            columnClassName: 'td-column-info',
            formatter: (cell, row) => {
                const { _id: cycleName } = row;
                return cycleNameFormatter(cycleName);
            }
        }, {
            dataField: 'bdtCount',
            text: 'BDT',
            width: '100px',
            className: 'td-header-success'
        }, {
            dataField: 'bdaTCount',
            text: 'BDAT',
            width: '100px',
            className: 'td-header-success'
        }, {
            dataField: 'bdaCount',
            text: 'BDA',
            width: '100px',
            className: 'td-header-success'
        }, {
            dataField: 'seniorBdaCount',
            text: 'Senior BDA',
            width: '150px',
            className: 'td-header-success'
        }, {
            dataField: 'bdtmCount',
            text: 'BDTM',
            width: '100px',
            className: 'td-header-secondary'
        }, {
            dataField: 'tmCount',
            text: 'TM',
            width: '100px',
            className: 'td-header-secondary'
        }, {
            dataField: 'assistantSeniorBdtmCount',
            text: 'Assistant Senior BDTM',
            width: '200px',
            className: 'td-header-warning'
        }, {
            dataField: 'assistantSeniorManagerCount',
            text: 'Assistant Senior Manager',
            width: '200px',
            className: 'td-header-warning'
        }, {
            dataField: 'seniorBdtmCount',
            text: 'Senior BDTM',
            width: '150px',
            className: 'td-header-warning'
        }, {
            dataField: 'smCount',
            text: 'SM',
            width: '100px',
            className: 'td-header-warning'
        }, {
            dataField: 'avpCount',
            text: 'AVP',
            width: '100px',
            className: 'td-header-info'
        }, {
            dataField: 'directorCount',
            text: 'Director',
            width: '100px',
            className: 'td-header-info'
        }, {
            dataField: 'thCount',
            text: 'Team Head',
            width: '130px',
            className: 'td-header-info'
        }];
    }

    render() {
        const { loading, error, cycleId, formValues } = this.state;
        const columns = this.getColumns();
        const gridDataUrl = `/usermanagement/employeesnapshot/getSnapshotSummary?cycleId=${cycleId}`;

        return (
            <Box>
                <BoxBody loading={loading} error={error}>
                    <ByjusGrid
                        ref="byjusGrid"
                        columns={columns}
                        gridDataUrl={gridDataUrl}
                    />
                </BoxBody>
            </Box>
        )
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(EmployeeSnapshotSummary);
