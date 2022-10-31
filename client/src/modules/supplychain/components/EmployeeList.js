import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import moment from 'moment';
import { Link } from 'react-router-dom'
import { startCase, get, concat, isEmpty } from 'lodash';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { supplyChain, validatePermission } from 'lib/permissionList';

import UserHistory from '../../user/components/UserHistory';

class EmployeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    buildToolbarItems = () => {
        const { user = {}, subDepartment } = this.props;
        let toPath = isEmpty(subDepartment) ? `create/supply_chain` : `create/supply_chain/${get(subDepartment, "formattedName")}`;
        const canCreateScUser = validatePermission(user, [supplyChain.createScEmployees]);

        return (
            <>
                <Link className="btn btn-success btn-sm" to={toPath} hidden={!canCreateScUser} >
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
        const { subDepartment, roles } = this.props || {};

        let departmentFilter = [{
            selectedColumn: "department",
            selectedOperator: "in",
            selectedValue: ["supply_chain"]
        }];

        const contextCriterias = departmentFilter;

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
        let pills = [{
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

        return pills;
    }

    getList = () => {
        let pills = []
        let defaultPill = 1;
        const { subDepartment } = this.props || {};
        pills = this.getListPills();

        let { user = {} } = this.props;
        const canEditScUser = validatePermission(user, [supplyChain.editScEmployees]);

        const formatters = () => ({
            nameFormatter: (cell, row) => {
                let subDepartment = isEmpty(get(row, "subDepartment")) ? undefined : row.subDepartment;
                if (canEditScUser) {
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
                        <Link to={{ pathname: `${row.email}/${subDepartment}/edit` }}
                            hidden={!canEditScUser}
                            className="btn btn-primary btn-sm">
                            <i className="fa fa-pencil" />
                        </Link>
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
                ref="byjusGrid"
                isKey="_id"
                toolbarItems={this.buildToolbarItems()}
                formatters={formatters()}
                modelName="ScEmployee"
                pillOptions={{
                    pills,
                    defaultPill
                }}
                gridId="ums_sc_grid"
                gridTitle="SC Employees"
                gridDataUrl={`/usermanagement/scemployee/listData`}
                sort={{ email: 'asc' }}
            />)
    }

    render() {
        const { loading, error, showRoleHistory, selectedRow, roleHistory } = this.state;

        return (
            <>
                {/*<BoxBody loading={loading} error={error}>*/}
                {this.getList()}
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
