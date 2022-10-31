import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import moment from 'moment';
import { Link } from 'react-router-dom'
import { startCase, get, concat, isEmpty } from 'lodash';

import { BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import UserHistory from '../../user/components/UserHistory';
import { userExperience, validatePermission } from 'lib/permissionList';
import { getUeUserStatuses } from '../../user/utils/userUtil';

class EmployeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    buildToolbarItems = () => {
        let { user = {}, subDepartment } = this.props;
        let toPath = isEmpty(subDepartment) ? "create/user_experience" : `create/user_experience/${get(subDepartment, "formattedName")}`;
        const canCreateUxUser = validatePermission(user, [userExperience.createUxEmployees]);

        return (
            <>
                <Link className="btn btn-success btn-sm" hidden={!canCreateUxUser} to={toPath} >
                    <i className="fa fa-plus"></i> {' '}Create
                </Link>{' '}
            </>
        )
    }

    onClickRoleHistory = (selectedRow) => {
        const { history } = selectedRow;
        const roleHistory = history && history
            .filter(entry => !!(entry.changes && entry.changes.role))
            .map(entry => ({ ...entry, changes: { role: entry.changes.role } }));
        this.setState({ showRoleHistory: true, selectedRow, roleHistory })
    }

    getListPills = () => {
        const { subDepartment, roles, selectedPill } = this.props || {};
        let pills = [];

        let departmentFilter = [{
            selectedColumn: "department",
            selectedOperator: "in",
            selectedValue: ["user_experience"]
        }];

        const contextCriterias = departmentFilter;

        if (selectedPill === "All") {
            let statusArray = getUeUserStatuses();

            /**Creating pills based on hierarchy roles */
            pills = [{
                title: 'All',
                contextCriterias
            }];

            statusArray && statusArray.map(status => {
                const statusFilter = [{
                    selectedColumn: "status",
                    selectedOperator: "in",
                    selectedValue: status
                }];

                pills.push({
                    title: status,
                    status: status,
                    contextCriterias: concat(departmentFilter, statusFilter)
                });
            });
        }
        else {
            if (!isEmpty(subDepartment)) {
                contextCriterias.push({
                    selectedColumn: "subDepartment",
                    selectedOperator: "in",
                    selectedValue: [get(subDepartment, 'formattedName')]
                });
            }

            let subDepartmentFilter = [{
                selectedColumn: "subDepartment",
                selectedOperator: "in",
                selectedValue: [get(subDepartment, 'formattedName')]
            }];

            let activeStatusFilter = [{
                selectedColumn: "status",
                selectedOperator: "not_in",
                selectedValue: ['Exit', 'exit']
            }];

            let nonActiveStatusFilter = [{
                selectedColumn: "status",
                selectedOperator: "in",
                selectedValue: ['Exit', 'exit']
            }];

            /**Creating pills based on hierarchy roles */
            pills = [{
                title: 'All',
                contextCriterias
            }];

            roles && roles.map(role => {
                const roleFilter = [{
                    selectedColumn: "role",
                    selectedOperator: "in",
                    selectedValue: [get(role, 'formattedName')]
                }];

                pills.push({
                    title: startCase(get(role, 'name', '')),
                    role: get(role, 'formattedName'),
                    contextCriterias: concat(subDepartmentFilter, activeStatusFilter, roleFilter)
                });
            });
        }
        return pills;
    }

    getUserExpList = () => {
        let pills = []
        let defaultPill = 1;
        const { subDepartment } = this.props || {};
        pills = this.getListPills();

        let { user = {} } = this.props;
        const canEditUxUser = validatePermission(user, [userExperience.editUxEmployees]);

        const formatters = () => ({
            nameFormatter: (cell, row) => {
                let subDepartment = isEmpty(get(row, "subDepartment")) ? undefined : row.subDepartment;
                if (canEditUxUser) {
                    return <Link to={{ pathname: `${row.email}/${subDepartment}/edit` }}>{startCase(cell)}</Link>
                }
                else {
                    return startCase(cell);
                }
            },
            actionFormatter: (cell, row) => {
                let subDepartment = isEmpty(get(row, "subDepartment")) ? undefined : row.subDepartment;
                return (
                    <>
                        <Link
                            to={{ pathname: `${row.email}/${subDepartment}/edit` }}
                            hidden={!canEditUxUser}
                            className="btn btn-primary btn-sm"
                        ><i className="fa fa-pencil" /></Link>
                    </>
                )
            },
            statusFormatter: (status) => {
                status = startCase(status);
                const styleMap = {
                    'Active': 'green',
                    'Exit': 'red',
                    'Transition': 'blue',
                    'Long Leave': '#bebf50',
                    'Maternity': 'pink',
                    'Notice Period': 'brown'
                }

                return <div style={{ color: styleMap[status] }}>{status}</div>
            },
            tnlFormatter: (cell) => {
                return cell && cell.toUpperCase();
            },
            roleFormatter: (role, row) => {
                return <>
                    <span>{role && role.name}</span>
                    <Button color="link" size="sm" className="ml-2" onClick={() => this.onClickRoleHistory(row)}>
                        <i className="fa fa-history" />
                    </Button>
                </>
            },
            dojFormatter: (cell) => {
                return cell && moment(cell).format('DD MMM YYYY');
            }
        })

        /* ToDo: Modify ByjusGridV3 code to handle overriding of existing pills based on subdepartments */
        return (
            <ByjusGrid
                isKey="_id"
                ref="byjusGrid"
                toolbarItems={this.buildToolbarItems()}
                formatters={formatters()}
                modelName="UeEmployee"
                pillOptions={{
                    pills,
                    defaultPill
                }}
                gridTitle="UX Employees"
                gridId="ums_ux_grid"
                gridDataUrl={`/usermanagement/ueemployee/listData`}
                sort={{ email: 'asc' }}
            />)
    }

    render() {
        const { loading, error, showRoleHistory, selectedRow, roleHistory } = this.state;
        return (
            <>
                {/* <BoxHeader></BoxHeader> */}
                {/*<BoxBody loading={loading} error={error}>*/}
                {this.getUserExpList()}
                {showRoleHistory &&
                    <UserHistory
                        history={roleHistory}
                        userData={selectedRow}
                        closeModal={() =>
                            this.setState({ showRoleHistory: false })
                        }
                    />
                }
                {/*</BoxBody>*/}
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(EmployeeList);
