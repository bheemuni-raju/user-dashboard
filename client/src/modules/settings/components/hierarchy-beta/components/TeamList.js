import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { get, startCase, upperCase } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import { callApi } from 'store/middleware/api';
import TabBuilder from 'modules/core/components/TabBuilder';

import AssignReportersModal from './assign/AssignReportersModal';
import { modelMap } from '../../../../user/utils/userUtil';

class TeamList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            teamRoles: null,
            hierarchyRoles: null,
            miscellaneousRoles: null,
            showAssignReportersModal: false
        }
    }

    onClickAssignReporters = (row) => {
        this.setState({ showAssignReportersModal: true, reportingToData: row });
    }

    onCloseAssignReporters = () => {
        this.setState({ showAssignReportersModal: false, reportingToData: null });
    }

    getColumns = (roleType) => {
        const { teamRoles } = this.state;
        const columns = [{
            dataField: 'name',
            text: 'Name',
            formatter: (cell, row) => {
                return <Link
                    to={{ pathname: `team/employee/${row._id}`, state: { teamRoles, userData: row, roleType } }}
                >{startCase(cell)}</Link>
            }
        }, {
            dataField: "email",
            text: "Email"
        }, {
            dataField: 'tnlId',
            text: 'TnL Id',
            formatter: (cell) => {
                return upperCase(cell);
            }
        },
        /*{
            dataField: '',
            text: 'Actions',
            formatter: (cell, row) => {
                const canAssignReporters = get(row, 'role.level') != 1;
                return (
                    <div>
                        {canAssignReporters && <Button color="warning" size="sm" onClick={() => this.onClickAssignReporters(row)}>
                            <i className="fa fa-plus" />{" "}<i className="fa fa-users" /> Assign Reporters
                        </Button>}
                    </div>
                )
            }
        },*/
        {
            dataField: 'status',
            text: 'Status',
            formatter: (status) => {
                status = startCase(status);
                const styleMap = {
                    'Active': 'green',
                    'Left': 'red',
                    'Training': 'blue',
                    'Longleave': '#bebf50',
                    'Campaign Training': 'pink',
                    'Non Sales': 'maroon'
                }

                return <div style={{ color: styleMap[status] }}>{status}</div>
            }
        }, {
            dataField: "campaign",
            text: "Campaign"
        }, {
            dataField: "vertical",
            text: "Vertical"
        }];

        return columns;
    }

    getPills = (roles, roleType) => {
        let pills = [{
            title: 'All',
            contextCriterias: [{
                selectedColumn: "status",
                selectedOperator: "not_in",
                selectedValue: ['Left', 'left']
            }]
        }];

        roles && roles.map(role => {
            pills.push({
                title: startCase(get(role, 'name', '')),
                contextCriterias: [{
                    selectedColumn: (roleType === "HIERARCHY") ? "role" : "miscellaneousRole",
                    selectedOperator: "in",
                    selectedValue: [get(role, 'formattedName')]
                }, {
                    selectedColumn: "status",
                    selectedOperator: "not_in",
                    selectedValue: ['Left', 'left']
                }]
            })
        });

        return pills;
    }

    getGrid = (roles, roleType) => {
        const { subDepartment, subDepartmentData } = this.state;
        const columns = this.getColumns(roleType);
        const pills = this.getPills(roles, roleType);

        return (<ByjusGrid
            ref="byjusGrid"
            columns={columns}
            pillOptions={{
                pills,
                defaultPill: 1
            }}
            contextCriterias={[{
                selectedColumn: "subDepartment",
                selectedOperator: "equal",
                selectedValue: subDepartment
            }]}
            modelName={modelMap[get(subDepartmentData, 'departmentFormattedName')] || "Employee"}
            gridDataUrl={`/usermanagement/common/grid`}
        />
        )
    }

    /**Get All Roles of a SubDepartment */
    getTeamRoles = async (subDepartment) => {
        this.setState({ loading: true });
        const body = {
            "model": "Role",
            "page": 1,
            "filter": { subDepartmentFormattedName: subDepartment },
            "limit": 50,
            "sort": {
                "level": "asc"
            }
        };

        callApi(`/usermanagement/hierarchy/role/subdepartmentroles/?subDepartmentName=${subDepartment}`, 'GET', null, null, null, true)
            .then(response => {
                const teamRoles = response || [];
                const hierarchyRoles = teamRoles.filter(role => get(role, 'type') === "HIERARCHY");
                const miscellaneousRoles = teamRoles.filter(role => get(role, 'type') === "MISCELLANEOUS");
                this.setState({ teamRoles, hierarchyRoles, miscellaneousRoles, loading: false, error: null });
            })
            .catch(error => {
                this.setState({ loading: false, error });
            })
    }

    componentDidMount = async () => {
        const { subDepartment } = get(this.props, 'match.params');
        const { subDepartmentData } = get(this.props, 'location.state');

        if (subDepartment) {
            this.setState({ subDepartment, subDepartmentData });
            await this.getTeamRoles(subDepartment);
        }
    }

    render = () => {
        const { loading, error,
            hierarchyRoles, miscellaneousRoles, subDepartmentData,
            showAssignReportersModal, reportingToData } = this.state;

        const tabs = [{
            title: "Hierarchy Roles",
            component: hierarchyRoles && this.getGrid(hierarchyRoles, "HIERARCHY")
        }, {
            title: "Application Roles",
            component: miscellaneousRoles && this.getGrid(miscellaneousRoles, "MISCELLANEOUS")
        }];

        return (
            <Box>
                <BoxHeader heading={`${get(subDepartmentData, 'name', '')} Hierarchy`} closeBtn={true} />
                <BoxBody loading={loading} error={error}>
                    <TabBuilder tabs={tabs} />
                </BoxBody>
                {showAssignReportersModal &&
                    <AssignReportersModal
                        reportingToData={reportingToData}
                        closeModal={this.onCloseAssignReporters}
                    />
                }
            </Box>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(TeamList);
