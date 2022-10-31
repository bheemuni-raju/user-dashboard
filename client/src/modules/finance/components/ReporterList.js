import React, { Component } from 'react';
import { Card, Col, Row, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { get, find, concat, startCase, capitalize } from 'lodash';

import { callApi } from 'store/middleware/api';
import TabBuilder from 'modules/core/components/TabBuilder';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { FormBuilder } from 'components/form';

class ReporterList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userExpDetails: null,
            userData: null,
            loading: true,
            error: null
        }
    }

    getEmployeeDetails = (userData) => {
        const { teamRoles } = this.state;
        const { reportingTo } = userData;

        const initialValues = {
            ...userData,
            name: startCase(get(userData, 'name')),
            role: get(userData, 'role'),
            tnlId: capitalize(get(userData, 'tnlId'))
        }

        const reportingToFields = Object.keys(reportingTo).map(rep => {
            initialValues[rep] = reportingTo[rep];
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

    getColumns = () => {
        const columns = [{
            dataField: 'name',
            text: 'Name',
            formatter: (cell) => {
                return startCase(cell);
            }
        }, {
            dataField: "email",
            text: "Email",
            quickFilter: true
        }, {
            dataField: 'status',
            text: 'Status',
            quickFilter: true,
            formatter: (status) => {
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
            }
        }, {
            dataField: "campaign",
            text: "Region",
            quickFilter: true
        }, {
            dataField: "vertical",
            text: "Vertical",
            quickFilter: true
        }];

        return columns;
    }

    getPills = (userExpDetails, userData) => {
        const roles = get(userExpDetails, 'roles', []);
        const userRole = get(userData, 'role');
        let reportersRoles = roles.filter(role => {
            if (get(role, 'level') > 0 && get(role, 'level') < get(userRole, 'level')) {
                return role;
            }
        });

        reportersRoles = reportersRoles.sort((a, b) => a.level - b.level);
        let pills = reportersRoles && reportersRoles.map(role => {
            const userFilterQuery = [{
                selectedColumn: "reportingTo.userEmail",
                selectedOperator: "in",
                selectedValue: [get(userData, 'email')]
            }];

            return {
                title: startCase(get(role, 'name', '')),
                contextCriterias: [
                    ...userFilterQuery,
                    {
                        selectedColumn: "role",
                        selectedOperator: "equal",
                        selectedValue: role
                    },
                    {
                        selectedColumn: "status",
                        selectedOperator: "not_in",
                        selectedValue: ['Exit', 'exit']
                    }]
            }
        });

        return pills;
    }

    getReporters = (userExpDetails, userData) => {
        const columns = this.getColumns();
        const userRole = get(userData, 'role');
        let contextCriterias = [];
        let pills = this.getPills(userExpDetails, userData);

        const props = {
            ref: "byjusGrid",
            columns: columns,
            modelName: "Employee",
            contextCriterias: contextCriterias,
            pillOptions: {
                pills
            },
            gridDataUrl: `/usermanagement/financeemployee/listData`
        }

        return pills.length ?
            <ByjusGrid
                {...props}
            /> :
            <div>No Reporters</div>
    }

    getUserExpDetails = () => {
        let { teamDetails = {} } = this.props;
        let subDepartmentName = get(teamDetails, 'formattedName');
        const bodyPayload = {
            name: subDepartmentName
        }

        this.setState({ loading: true, error: null });
        callApi(`/usermanagement/hierarchy/subDepartment/details`, 'POST', bodyPayload, null, null, true)
            .then(response => {
                this.setState({ userExpDetails: response, loading: false, error: null })
            })
            .catch(error => {
                this.setState({ loading: false, error });
            })
    }

    getUserDetails = async (email) => {
        const bodyPayload = {
            email
        }

        await callApi(`/usermanagement/employee/getByEmail`, 'POST', bodyPayload, null, null, true)
            .then(response => {
                this.setState({ userData: response, error: null });
                return;
            })
            .catch(error => {
                this.setState({ loading: false, error });
            });
    }

    componentDidMount = async () => {
        const { emailId } = this.props.match.params;
        this.setState({ emailId, loading: true });
        await this.getUserExpDetails();
        await this.getUserDetails(emailId);
        this.setState({ loading: false });
    }

    render = () => {
        const { userExpDetails, userData, emailId, loading, error } = this.state;
        const { } = this.props;

        return (
            <Box>
                <BoxHeader heading={`${(emailId)}`} closeBtn={true}></BoxHeader>
                <BoxBody loading={loading} error={error}>
                    {(userExpDetails && userData) ?
                        <Row gutter={16}>
                            <Col span={8}>
                                <Card title="User Details" bordered={false}>
                                    {this.getEmployeeDetails(userData)}
                                </Card>
                            </Col>
                            <Col span={16}>
                                <Card title="Covering Users" bordered={false}>
                                    {this.getReporters(userExpDetails, userData)}
                                </Card>
                            </Col>
                        </Row> :
                        <div style={{ margin: '1%' }}>
                            < Alert type="success" message={`${emailId} : Fetching User Details & Reporters`
                            } />
                        </div>
                    }
                </BoxBody>
            </Box >)
    }
}

export default ReporterList;
