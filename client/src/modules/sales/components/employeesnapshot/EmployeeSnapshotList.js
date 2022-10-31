import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get, cloneDeep, remove, upperCase, startCase, isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

import { cycleNameFormatter } from 'utils/componentUtil';
import EmployeeSnapshotEditModal from './EmployeeSnapshotEditModal';
import EmployeeSnapshotBulkEditModal from './EmployeeSnapshotBulkEditModal';
import Confirm from 'components/confirm';
import { sales } from "lib/permissionList";

class EmployeeSnapshotList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEmployees: [],
            showEmployeeEditModal: false,
            selectedEmployeeDetails: {},
            showBulkUpdateEmployeeEditModal: false,
            latestGeneratedCycle: "",
            response: [],
            rolesOptions: [],
        };
    }

    onLoadDataCompletion = (response) => {
        this.setState({ response });
    }

    refreshGrid = () => {
        const byjusGrid = this.refs.byjusGrid;
        byjusGrid.onClickRefresh();
    }

    handleEmployeeSnapshotEdit = row => {
        this.setState({
            showEmployeeEditModal: true,
            selectedEmployeeDetails: row
        });
    };

    closeEmployeeEditModal = () => {
        this.setState({
            showEmployeeEditModal: false,
            showBulkUpdateEmployeeEditModal: false
        });
    };

    loadBulkUpdateEmployeeModal = row => {
        if (this.state.selectedEmployees.length !== 0) {
            this.setState({
                showBulkUpdateEmployeeEditModal: true,
                selectedEmployeeDetails: row
            });
        }
    };

    getColumns = () => {
        return [{
            dataField: 'employee_email',
            filterType: 'TEXT',
            text: 'Employee Email',
            quickFilter: true
        }, {
            dataField: 'actions',
            isDummyField: true,
            text: 'Actions',
            width: 80,
            formatter: (cell, row) => {
                const { user } = this.props;
                const permissionList = get(user, 'permissions', []);
                const editEmployeeSnapshot = permissionList.includes(sales.editSalesSnapshotCard);
                if (!editEmployeeSnapshot) return;
                return (
                    <Button
                        size="sm"
                        color="success"
                        onClick={() => this.handleEmployeeSnapshotEdit(row)}
                    >
                        <i className="fa fa-pencil" />
                    </Button>
                );
            }
        }, {
            dataField: 'cycle_name',
            filterType: 'TEXT',
            text: 'Cycle Name',
            width: 220,
            formatter: (cell, row) => {
                const { cycle_name } = row;
                return cycleNameFormatter(cycle_name);
            },
            quickFilter: true
        }, {
            dataField: 'role',
            filterType: 'TEXT',
            text: 'Employees Role',
            width: 150,
            quickFilter: true,
            formatter: (cell, row) => {
                const { role } = row;
                return upperCase(role);
            }
        }, {
            dataField: 'tnl_id',
            filterType: 'TEXT',
            text: 'Tnl Id',
            quickFilter: true,
            formatter: (cell) => {
                return cell && cell.toUpperCase();
            }
        }, {
            dataField: 'status',
            filterType: 'TEXT',
            text: 'Status',
            quickFilter: true,
            formatter: (cell) => {
                return startCase(cell);
            }
        }, {
            dataField: 'vertical',
            filterType: 'TEXT',
            text: 'Vertical',
            quickFilter: true
        }, {
            dataField: 'campaign',
            filterType: 'TEXT',
            text: 'Campaign',
            quickFilter: true
        }, {
            dataField: 'location',
            filterType: 'TEXT',
            text: 'Location',
            quickFilter: true
        }, {
            dataField: 'unit',
            filterType: 'TEXT',
            text: 'Unit',
            quickFilter: true
        }, {
            dataField: 'reporting_manager_email',
            filterType: 'TEXT',
            text: 'Reporting Manager Email',
            quickFilter: true
        }, {
            dataField: 'reporting_manager_role',
            filterType: 'TEXT',
            text: 'Reporting Manager Role',
            quickFilter: true,
            formatter: (cell, row) => {
                const { reporting_manager_role } = row;
                return upperCase(reporting_manager_role);
            }
        }, {
            dataField: 'reporting_manager_tnl_id',
            filterType: 'TEXT',
            text: 'Reporting Manager TNL ID',
            quickFilter: true,
            formatter: (cell) => {
                return cell && cell.toUpperCase();
            }
        }, {
            dataField: 'cohortId',
            filterType: 'TEXT',
            text: 'Cohort Id',
            quickFilter: true,
            formatter: (cell) => {
                return cell ? upperCase(cell) : "N/A"
            }
        }, {
            dataField: 'source',
            filterType: 'TEXT',
            text: 'Source',
            quickFilter: true,
            formatter: (cell) => {
                return cell ? startCase(cell) : "N/A"
            }
        }];
    };

    componentDidMount = () => {
        this.setState({ loading: true, error: null });
        callApi(
            `/usermanagement/employeesnapshot/getCycle`,
            'POST',
            { cycleType: "weekly" },
            null,
            null,
            true
        )
            .then(response => {
                response.map(cycle => {
                    return {
                        label: cycle.cycleName,
                        value: cycle.cycleName
                    };
                });

                this.setState({
                    latestGeneratedCycle: response[0].cycleName,
                    loading: false,
                    error: null
                });
            })
            .catch(error => {
                console.log(error);
            });
        callApi(`/usermanagement/hierarchy/role/subdepartmentroles/?subDepartmentName=sales`, 'GET', null, null, null, true)
            .then(response => {
                const salesRoles = response || [];
                let roles = [];
                if (!isEmpty(salesRoles)) {
                    roles = salesRoles.map((eachSalesRole) => {
                        return {
                            label: eachSalesRole.name,
                            value: eachSalesRole.formattedName,
                        }
                    });
                    roles = [
                        ...roles,
                        {
                            value: "senior_bda",
                            label: "Senior BDA",
                        }
                    ];
                    this.setState({
                        rolesOptions: roles
                    })
                }
            })
            .catch(error => {
                this.setState({ loading: false, error });
            })
    };

    handleOnSelectAll = (isSelectedAll, selectedItems) => {
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
        const { cycleName } = this.props.match.params;
        const { latestGeneratedCycle } = this.state;
        const selectedCycle = latestGeneratedCycle === cycleName ? false : true;
        const { selectedEmployees } = this.state;
        const enableBulkUpdate = selectedEmployees.length !== 0 ? true : false;
        const { user } = this.props;
        const permissionList = get(user, 'permissions', []);
        const editEmployeeSnapshot = permissionList.includes(sales.editSalesSnapshotCard);
        if (!editEmployeeSnapshot) return;
        return (
            <>
                <Link to={{ pathname: `es-syncdata/${cycleName}` }} >
                    <Button color="primary" style={{ marginRight: "5px" }} disabled={selectedCycle}>
                        New Users
                </Button>
                </Link>
                <Button color="primary" onClick={this.loadBulkUpdateEmployeeModal} disabled={!enableBulkUpdate}>
                    Bulk update
            </Button>
            </>
        )
    };

    render() {
        const { cycleName } = this.props.match.params;
        const { selectedEmployees, showEmployeeEditModal, showBulkUpdateEmployeeEditModal,
            selectedEmployeeDetails, response, latestGeneratedCycle, error } = this.state;

        const formattedCycleName = cycleNameFormatter(cycleName);
        const columns = this.getColumns();
        const gridDataUrl = `/usermanagement/employeesnapshot/list?filterBy=${cycleName}`;
        const selectedCycle = latestGeneratedCycle === cycleName ? latestGeneratedCycle : null;
        const loadEditEmployeeModal = showEmployeeEditModal ? (
            <EmployeeSnapshotEditModal
                closeModal={this.closeEmployeeEditModal}
                refreshGrid={this.refreshGrid}
                selectedEmployeeDetails={selectedEmployeeDetails}
                cycleFilters={cycleName}
                latestGeneratedCycle={selectedCycle}
                roleOptions={this.state.rolesOptions}
            />
        ) : null;

        const loadBulkUpdateEditEmployeeModal = showBulkUpdateEmployeeEditModal ? (
            <EmployeeSnapshotBulkEditModal
                closeModal={this.closeEmployeeEditModal}
                refreshGrid={this.refreshGrid}
                cycleFilters={cycleName}
                selectedEmployees={selectedEmployees}
                updateRows={response}
                latestGeneratedCycle={selectedCycle}
                roleOptions={this.state.rolesOptions}
            />
        ) : null;

        const selectRowProp = {
            mode: "checkbox",
            bgColor: "lightblue",
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll,
            clickToSelect: false,
        };

        return (
            <Box>
                <BoxHeader><b>Employee Snapshot History - {formattedCycleName}</b></BoxHeader>
                <BoxBody >
                    <Fragment>
                        <ByjusGrid
                            ref="byjusGrid"
                            columns={columns}
                            modelName="AchieveAnalytics"
                            selectRow={selectRowProp}
                            toolbarItems={this.buildToolbarItems()}
                            onLoadDataCompletion={this.onLoadDataCompletion}
                            gridDataUrl={gridDataUrl}
                            sort={{ createdAt: "desc" }}
                            handleCellEdit={this.handleCellEdit}
                            error={error}
                            sizePerPageList={[10, 50, 100, 200]}
                        />
                        {loadEditEmployeeModal}
                        {loadBulkUpdateEditEmployeeModal}
                    </Fragment>
                </BoxBody>
            </Box>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(EmployeeSnapshotList);
