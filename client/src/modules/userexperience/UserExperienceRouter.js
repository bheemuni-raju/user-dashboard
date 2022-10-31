import React from "react";
import { Route } from "react-router-dom";

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { userExperience } from 'lib/permissionList';

import UserExpLandingPage from './UserExperienceLandingPage';
import UserExpDashboard from './components/EmployeeDashboard';
import UserExpEmployeeForm from './components/EmployeeForm';
import UserExpReporterList from './components/ReporterList';

const canViewUxLandingPage = requireRole(userExperience.viewUxEmployees);
const canViewUxGrid = requireRole([userExperience.viewUxEmployees]);
const canCreateUxGrid = requireRole([userExperience.createUxEmployees]);
const canEditUxGrid = requireRole([userExperience.editUxEmployees]);

const UserExperienceRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewUxLandingPage(UserExpLandingPage)} />
        <Route path={`${match.url}/dashboard`} exact component={canViewUxGrid(UserExpDashboard)} />
        <Route path={`${match.url}/:email/:subDepartment/edit`} exact component={canEditUxGrid(UserExpEmployeeForm)} />
        <Route path={`${match.url}/reporters/list/:emailId`} exact component={UserExpReporterList} />
        <Route path={`${match.url}/create/:department/:subDepartment`} exact component={canCreateUxGrid(UserExpEmployeeForm)} />
        <Route path={`${match.url}/create/:department/`} exact component={canCreateUxGrid(UserExpEmployeeForm)} />
    </SwitchWithNotFound>
);

export default UserExperienceRouter;