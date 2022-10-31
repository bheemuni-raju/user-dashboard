import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get, cloneDeep, remove } from 'lodash';
import { Button} from 'reactstrap';
import moment from 'moment';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

import { cycleNameFormatter } from 'utils/componentUtil';
import UserHistory from 'modules/user/components/UserHistory';
import { hierarchy } from 'lib/permissionList';

class EmployeeSnapshotHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            historyData : [],
            selectedEmployees: [],
            showHistoryModal:false
        };
    }

    onClickHistory = (row) => {
        this.setState(
            { showHistoryModal: true,
              historyData : row  
         });
    }

    onCloseHistoryModal = () => {
        this.setState({ showHistoryModal: false });
    }

    getColumns = () => {
        return [{
            dataField: 'employee_email',
            filterType: 'TEXT',
            text: 'Employee Email',
            quickFilter: true
        },{
            dataField: 'updatedAt',
            filterType: 'TEXT',
            text: 'UpdatedAt',
            formatter: (cell) => {
                    return moment(cell).format('LLL');
                  }
        },{
            dataField: 'updatedBy',
            filterType: 'TEXT',
            text: 'UpdatedBy',
            quickFilter: true
        }, {
            dataField: 'actions',
            isDummyField: true,
            text: 'Actions',
            width: 100,
            formatter: (cell, row) => {
                return (
                    <Button
                        size="sm"
                        color="success"
                        onClick={() => this.onClickHistory(row)}
                    >
                        Check History 
                        <i style={{ padding : "2%" }} className="fa fa-history" />
                    </Button>
                );
            }
        }];
    };

    render() {
        const { cycleName } = this.props.match.params;
        const columns = this.getColumns();
        const gridDataUrl = `/usermanagement/employeesnapshot/getWorkflowHistory?cycleName=${cycleName}`;
        const formattedCycleName = cycleNameFormatter(cycleName);
        return (
            <Box>
                <BoxHeader><b>Employee Snapshot History / {formattedCycleName}</b></BoxHeader>
                <BoxBody >
                        <ByjusGrid
                            ref="snapshotGrid"
                            columns={columns}
                            modelName="AchieveAnalytics"
                            gridDataUrl={gridDataUrl}
                            sort={{ updatedAt: "desc" }}
                        />
                </BoxBody>
                {this.state.showHistoryModal &&
                    <UserHistory
                        history={this.state.historyData.history}
                        closeModal={() => { this.onCloseHistoryModal() }}
                    />}
            </Box>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(EmployeeSnapshotHistory);
