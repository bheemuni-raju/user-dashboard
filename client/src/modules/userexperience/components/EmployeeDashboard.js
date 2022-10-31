import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { get, filter, orderBy } from 'lodash';

import { Box, BoxBody } from 'components/box';
import TabBuilder from 'modules/core/components/TabBuilder';
import { callApi } from 'store/middleware/api';

import EmployeeList from './EmployeeList';

class EmployeeDashboard extends Component {
    state = {
        subDepartments: [],
        roles: []
    }

    componentDidMount = () => {
        this.getSubDepartmentDetails();
    }

    getSubDepartmentDetails = async () => {
        this.setState({ loading: true });
        await callApi(`/usermanagement/hierarchy/department/getDetails`, 'POST', {
            name: "user_experience"
        }, null, null, true)
            .then(response => {
                this.setState({
                    subDepartments: response.subDepartments,
                    roles: response.roles,
                    loading: false,
                    error: null
                });
            })
            .catch(error => {
                this.setState({ error, loading: false });
            })
    }

    render() {
        let { subDepartments, roles, loading } = this.state;
        let tabs = [];

        tabs.push({
            icon: "bjs-ums-dashboard-sales-employee-icon",
            title: "All",
            component: <EmployeeList department="user_experience" subDepartment={null} selectedPill="All" />
        });

        if (subDepartments.length > 0) {
            subDepartments = orderBy(subDepartments, ['name'], ['asc']);
            subDepartments.forEach(subDepartment => {
                let hierarchyRoles = filter(roles, (role) => {
                    if ((get(role, 'type') == "HIERARCHY") && (role.subDepartmentFormattedName == subDepartment.formattedName)) {
                        return role;
                    }
                });
                hierarchyRoles = orderBy(hierarchyRoles, ['level'], ['asc']);
                tabs.push({
                    icon: "bjs-ums-dashboard-sales-employee-icon",
                    title: subDepartment.name,
                    component: <EmployeeList department="user_experience" subDepartment={subDepartment} roles={hierarchyRoles} />
                })
            })
        }

        return (
            <Box>
                <BoxBody loading={loading}>
                    {subDepartments && <TabBuilder tabs={tabs} />}
                </BoxBody>
            </Box>
        );
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default withRouter(connect(mapStateToProps)(EmployeeDashboard)) 
