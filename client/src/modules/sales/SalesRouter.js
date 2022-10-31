import React from "react";
import { Route } from "react-router-dom";

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { businessDevelopment } from 'lib/permissionList';

import SalesLandingPage from './SalesLandingPage';
import SalesEmployeeGrid from './components/EmployeeDashboard';
import SalesEmployeeForm from './components/EmployeeForm';
import SalesSummary from './components/Summary';

const viewBD = [
    businessDevelopment.viewBDEmployees,
    businessDevelopment.viewBDSummary
];
const canViewBdLandingPage = requireRole(viewBD);
const canViewBDGrid = requireRole(businessDevelopment.viewBDEmployees);
const canCreateBDGrid = requireRole(businessDevelopment.createBDEmployees);
const canEditBDGrid = requireRole(businessDevelopment.editBDEmployees);
const canViewBDSummary = requireRole(businessDevelopment.viewBDSummary);

const SalesRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewBdLandingPage(SalesLandingPage)} />
        <Route path={`${match.url}/dashboard`} exact component={canViewBDGrid(SalesEmployeeGrid)} />
        <Route path={`${match.url}/sales-summary`} exact component={canViewBDSummary(SalesSummary)} />
        <Route path={`${match.url}/create/:department/:subDepartment`} exact component={canCreateBDGrid(SalesEmployeeForm)} />
        <Route path={`${match.url}/create/:department/`} exact component={canCreateBDGrid(SalesEmployeeForm)} />
        <Route path={`${match.url}/:userId/:subDepartment/edit`} exact component={canEditBDGrid(SalesEmployeeForm)} />
    </SwitchWithNotFound>
);

export default SalesRouter;