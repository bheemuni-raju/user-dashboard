import React, { Component } from 'react';
import { Card, Col, Row } from 'antd';
import { get, find, concat, startCase, capitalize, isEmpty, map } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import { FormBuilder } from 'components/form';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
//Need to think of better approach
import { modelMap } from 'modules/user/utils/userUtil';

class EmployeeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    getEmployeeDetails = (userData, roleType) => {
        const { teamRoles } = this.state;
        const { reportingTo } = userData;

        const initialValues = {
            ...userData,
            name: startCase(get(userData, 'name')),
            role: get(userData, 'role'),
            tnlId: capitalize(get(userData, 'tnlId'))
        }

        const reportingToFields = (isEmpty(reportingTo)) ? [] : Object.keys(reportingTo).map(rep => {
            initialValues[rep] = map(reportingTo[rep], 'userEmail').join();
            return {
                type: 'readonlytext',
                name: rep,
                label: startCase(rep)
            };
        })
        const fields = [{
            type: 'readonlytext',
            name: 'name',
            label: 'Name'
        }, {
            type: 'readonlytext',
            name: 'email',
            label: 'Email'
        }, {
            type: 'readonlytext',
            name: 'tnlId',
            label: 'Tnl Id'
        }, {
            type: 'readonlytext',
            name: 'location',
            label: 'Location'
        }, {
            type: 'readonlytext',
            name: 'status',
            label: 'Status'
        }, {
            type: 'readonlytext',
            name: 'role',
            label: 'Role'
        }];

        return (
            <FormBuilder
                fields={concat(fields, reportingToFields)}
                initialValues={initialValues}
                cols={1}
            />
        )
    }

    getColumns = (roleType) => {
        const columns = [{
            dataField: 'name',
            text: 'Name',
            formatter: (cell) => {
                return startCase(cell);
            }
        }, {
            dataField: "email",
            text: "Email"
        }, {
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

    getPills = (roles, userData, roleType) => {
        const userRole = get(userData, 'role');
        const userRoleData = find(roles, (r) => r.formattedName == userRole);
        const reportersRoles = roles.filter(role => {
            if (get(role, 'level') > 0 && get(role, 'level') < get(userRoleData, 'level')) {
                return role;
            }
        });

        const userFilterQuery = [{
            selectedColumn: `reportingTo.${userRole}.userEmail`,
            selectedOperator: "in",
            selectedValue: [get(userData, 'email')]
        }];

        let pills = [{
            title: 'All',
            contextCriterias: [
                ...userFilterQuery,
                {
                    selectedColumn: "status",
                    selectedOperator: "not_in",
                    selectedValue: ['Left', 'left']
                }]
        }];

        reportersRoles && reportersRoles.map(role => {
            pills.push({
                title: startCase(get(role, 'name', '')),
                contextCriterias: [
                    ...userFilterQuery,
                    {
                        selectedColumn: "role",
                        selectedOperator: "equal",
                        selectedValue: get(role, 'formattedName')
                    },
                    {
                        selectedColumn: "status",
                        selectedOperator: "not_in",
                        selectedValue: ['Left', 'left']
                    }]
            })
        });

        return pills;
    }

    getReporters = (teamRoles, userData, roleType) => {
        const columns = this.getColumns(roleType);
        const userRole = get(userData, 'role');
        let contextCriterias = [];
        let pills = [];

        if (roleType === "MISCELLANEOUS") {
            contextCriterias = [{
                selectedColumn: "managedBy.user",
                selectedOperator: "equal",
                selectedValue: get(userData, 'email')
            }, {
                selectedColumn: "managedBy.role",
                selectedOperator: "equal",
                selectedValue: userRole
            }, {
                selectedColumn: "status",
                selectedOperator: "not_in",
                selectedValue: ['Left', 'left']
            }]
        }
        else {
            pills = this.getPills(teamRoles, userData, roleType);
        }

        const props = {
            ref: "byjusGrid",
            columns: columns,
            contextCriterias: contextCriterias,
            modelName: modelMap[userData.department] || 'Employee',
            pillOptions: {
                pills
            },
            gridDataUrl: `/usermanagement/common/grid`
        }

        return ((roleType === "MISCELLANEOUS" || (roleType === "HIERARCHY" && pills.length)) ?
            <ByjusGrid
                {...props}
            /> :
            <div>No Reporters</div>
        )
    }

    componentDidMount = () => {
        const { teamRoles, userData, roleType } = get(this.props, 'location.state', {});

        let applicableRole = (roleType === "HIERARCHY") ? get(userData, 'role') : get(userData, 'miscellaneousRole');
        userData["role"] = applicableRole;
        this.setState({ teamRoles, userData, roleType });
        // this.getEmployeeDetails(userData);
    }

    render = () => {
        const { teamRoles, userData, roleType } = this.state;

        return (
            <Box>
                <BoxHeader heading={`${startCase(get(userData, 'name'))}`} closeBtn={true}></BoxHeader>
                <BoxBody>
                    {userData && <Row gutter={16}>
                        <Col span={8}>
                            <Card title="User Details" bordered={false}>
                                {this.getEmployeeDetails(userData, roleType)}
                            </Card>
                        </Col>
                        <Col span={16}>
                            <Card title="Covering Users" bordered={false}>
                                {this.getReporters(teamRoles, userData, roleType)}
                            </Card>
                        </Col>
                    </Row>}
                </BoxBody>
            </Box >)
    }
}

export default EmployeeDetails;
