import React from 'react';
import { Route } from 'react-router-dom';

import { user, sales } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import { Dashboard } from './components/AttendanceDashboard';
import AttendanceList from './components/attendance/AttendanceList';
import EmployeeList from './components/attendance/EmployeeList';
import WorkflowList from './components/workflow/WorkflowList';
import Summary from './components/dashboard/Summary';
import EmployeeRosterList from './components/attendance/EmployeeRosterList';

const canViewWFHDashboard = requireRole(sales.salesWFHDashboardCard);
const canViewWFHAttendance = requireRole(sales.salesWFHAttendanceCard);
const canViewWFHWorkflow = requireRole(sales.salesWFHWorkflowCard);
const canViewWFHSummary = requireRole(sales.salesWFHSummaryCard);

const WfhRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}/dashboard`} exact component={canViewWFHDashboard(Dashboard)} />
        <Route path={`${match.url}/attendance-list`} exact component={canViewWFHAttendance(AttendanceList)} />
        <Route path={`${match.url}/workflow-list`} exact component={canViewWFHWorkflow(WorkflowList)} />
        <Route path={`${match.url}/summary`} exact component={canViewWFHSummary(Summary)} />
        <Route path={`${match.url}/employee-list/:email`} exact component={canViewWFHAttendance(EmployeeList)} />
        <Route path={`${match.url}/agents`} exact component={canViewWFHAttendance(EmployeeList)} />
        <Route path={`${match.url}/employee-roster`} exact component={canViewWFHAttendance(EmployeeRosterList)} />
    </SwitchWithNotFound>
);

export default WfhRouter;
