import React from "react";
import { Route } from "react-router-dom";

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { finance } from 'lib/permissionList';

import FinanceLandingPage from './FinanceLandingPage';
import FinanceDashboard from './components/EmployeeDashboard';
import FinanceEmployeeForm from './components/EmployeeForm';
import FinanceReporterList from './components/ReporterList';

const canViewFinanceLandingPage = requireRole(finance.viewFinanceEmployees);
const canViewFinanceGrid = requireRole(finance.viewFinanceEmployees);
const canCreateFinanceGrid = requireRole(finance.createFinanceEmployees);
const canEditFinanceGrid = requireRole(finance.editFinanceEmployees);

const FinanceRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewFinanceLandingPage(FinanceLandingPage)} />
        <Route path={`${match.url}/dashboard`} exact component={canViewFinanceGrid(FinanceDashboard)} />
        <Route path={`${match.url}/:email/:subDepartment/edit`} exact component={canEditFinanceGrid(FinanceEmployeeForm)} />
        <Route path={`${match.url}/reporters/list/:emailId`} exact component={FinanceReporterList} />
        <Route path={`${match.url}/create/:department/:subDepartment`} exact component={canCreateFinanceGrid(FinanceEmployeeForm)} />
        <Route path={`${match.url}/create/:department/`} exact component={canCreateFinanceGrid(FinanceEmployeeForm)} />
    </SwitchWithNotFound>
);

export default FinanceRouter;