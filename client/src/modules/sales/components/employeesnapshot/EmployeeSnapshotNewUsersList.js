import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get, cloneDeep, remove } from 'lodash';
import { Button} from 'reactstrap';
import moment from 'moment';
import Notify from 'react-s-alert';
import Axios from 'axios';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

import { hierarchy } from 'lib/permissionList';

class EmployeeSnapshotNewUsersList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            historyData : [],
            selectedEmployees: [],
            showHistoryModal:false
        };
    }

    refreshGrid = () => {
        const byjusGrid = this.refs.byjusGrid;
        byjusGrid.onClickRefresh();
    }

    addNewSnapshotList = async (row) => {   
        const { cycleName } = this.props.match.params;
        let payload = {};
        const email = row.map(ele => ele.email);
        payload.employee_email = email;

          try {
            await Axios({
              url: `${window.NAPI_URL}/usermanagement/employeesnapshot/addNewSnapshotRecords?cycle_name=${cycleName}`,
              method: 'post',
              data: payload
            });

            Notify.success('Employee Snapshot updated successfully');
            this.refreshGrid();
            this.setState({selectedEmployees:[]});
          } catch (err) {
            this.setState({ loading: false, error: err });
            Notify.error(' Order update failed, please retry.');
          }
      };

    getColumns = () => {
        return [{
            dataField: 'email',
            filterType: 'TEXT',
            text: 'Employee Email',
            quickFilter: true
        },{
            dataField: 'tnlId',
            filterType: 'TEXT',
            text: 'Tnl Id',
            quickFilter: true,
            formatter: (cell) => {
                return cell && cell.toUpperCase();
            }  
        },{
            dataField: 'doj',
            filterType: 'TEXT',
            text: 'Date of Joining',
            quickFilter: true ,
            formatter: (cell) => {
                return moment(cell).format('LLL');
              } 
        },{
            dataField: 'createdAt',
            filterType: 'TEXT',
            text: 'CreatedAt',
            quickFilter: true ,
            formatter: (cell) => {
                return moment(cell).format('LLL');
              } 
        }];
    };

    handleOnSelectAll = (isSelectedAll, selectedItems) => {
        console.log("Selected All");
        if (isSelectedAll)
            this.setState({ selectedEmployees: selectedItems })
        else {
            this.setState({ selectedEmployees: [] })
        }
    };

    handleOnSelect = (selectedRow, isSelected) => {
        let employees = [];
        if (isSelected) {
            employees = cloneDeep(this.state.selectedEmployees);
            employees.push(selectedRow);
            this.setState({ selectedEmployees: employees });
        } else {
            employees = cloneDeep(this.state.selectedEmployees);
            remove(employees, ele => {
                return selectedRow.employee_email === ele.employee_email;
            });
            this.setState({ selectedEmployees: employees });
        }
    };

    buildToolbarItems = () => {
        const enableBulkUpdate = this.state.selectedEmployees.length !== 0 ? true : false;
        const selectedRows = this.state.selectedEmployees;
        return (
            <Button color="primary" onClick={() => this.addNewSnapshotList(selectedRows)} disabled={!enableBulkUpdate}>
                   <i className="fa fa-user-plus" style={{marginRight:"5px"}}></i>
                Move to Snapshot
            </Button>
        )
    };

    render() {
        const { cycleName } = this.props.match.params;
        const columns = this.getColumns();
        const gridDataUrl = `/usermanagement/employeesnapshot/getNewUsersList?cycleName=${cycleName}`;
        const selectRowProp = {
            mode: "checkbox",
            bgColor: "lightblue",
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll,
            clickToSelect: false,
        };

        return (
            <Box>
                <BoxHeader><b>New Users List</b></BoxHeader>
                <BoxBody >
                        <ByjusGrid
                            ref="byjusGrid"
                            columns={columns}
                            selectRow={selectRowProp}
                            modelName="AchieveAnalytics"
                            toolbarItems={this.buildToolbarItems()}
                            gridDataUrl={gridDataUrl}
                            sort={{ updatedAt: "desc" }}
                        />
                </BoxBody>
            </Box>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(EmployeeSnapshotNewUsersList);
