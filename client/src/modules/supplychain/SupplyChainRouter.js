import React from "react";
import { Route } from "react-router-dom";

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { supplyChain } from 'lib/permissionList';
import { concat } from 'lodash';

import SupplyChainLandingPage from './SupplyChainLandingPage';
import SupplyChainDashboard from './components/EmployeeDashboard';
import SupplyChainEmployeeForm from './components/EmployeeForm';
import SupplyChainReporterList from './components/ReporterList';
import SupplyChainSummary from './components/Summary';
import AttendancePortalRouter from "./components/attendanceportal/AttendancePortalRouter";

const viewSCEmployees = [
    supplyChain.viewScEmployees,
    supplyChain.viewScSummary
];
const viewSCAttendance = [
    supplyChain.viewScAttendancePortal,
    supplyChain.viewScAttendanceWorkflow,
    supplyChain.viewScTalktime,
    supplyChain.viewScDayOff,
    supplyChain.viewScAttendanceSummary
];
const viewSC = concat(viewSCEmployees, viewSCAttendance);
const canViewScLandingPage = requireRole(viewSC);
const canViewScGrid = requireRole(supplyChain.viewScEmployees);
const canCreateScGrid = requireRole(supplyChain.createScEmployees);
const canEditScGrid = requireRole(supplyChain.editScEmployees);
const canViewScSummary = requireRole([supplyChain.viewScSummary]);
const canViewScAttendance = requireRole(viewSCAttendance);

const SupplyChainRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewScLandingPage(SupplyChainLandingPage)} />
        <Route path={`${match.url}/dashboard`} exact component={canViewScGrid(SupplyChainDashboard)} />
        <Route path={`${match.url}/:email/:subDepartment/edit`} exact component={canEditScGrid(SupplyChainEmployeeForm)} />
        <Route path={`${match.url}/reporters/list/:emailId`} exact component={canViewScSummary(SupplyChainReporterList)} />
        <Route path={`${match.url}/create/:department/:subDepartment`} exact component={canCreateScGrid(SupplyChainEmployeeForm)} />
        <Route path={`${match.url}/create/:department/`} exact component={canCreateScGrid(SupplyChainEmployeeForm)} />
        <Route path={`${match.url}/sc-summary`} exact component={canViewScSummary(SupplyChainSummary)} />
        <Route path={`${match.url}/attendance-portal`} component={canViewScAttendance(AttendancePortalRouter)} />
    </SwitchWithNotFound>
);

export default SupplyChainRouter;