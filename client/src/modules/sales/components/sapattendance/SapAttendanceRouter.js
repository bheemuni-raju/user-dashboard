import React from 'react';
import { Route } from 'react-router-dom';

import { sales } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import AttendanceList from './components/dashboard/AttendanceList';
import SapAttendanceList from './components/dashboard/SapAttendanceList';
import AttendanceSummary from './components/summary/AttendanceSummary';
import SapAttendanceSummary from './components/summary/SapAttendanceSummary';

const canViewAttendanceDashboard = requireRole(sales.attendanceCard);
const canViewSAPAttendanceDashboard = requireRole(sales.sapAttendanceCard);
const canViewAttendanceSummary = requireRole(sales.attendanceSummaryCard);
const canViewSAPAttendanceSummary = requireRole(sales.sapAttendanceSummaryCard);

const SapRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}/attendance-list`} exact component={canViewAttendanceDashboard(AttendanceList)} />
        <Route path={`${match.url}/regular-attendance-list`} exact component={canViewSAPAttendanceDashboard(SapAttendanceList)} />
        <Route path={`${match.url}/attendance-summary`} exact component={canViewAttendanceSummary(AttendanceSummary)} />
        <Route path={`${match.url}/regular-attendance-summary`} exact component={canViewSAPAttendanceSummary(SapAttendanceSummary)} />
    </SwitchWithNotFound>
);

export default SapRouter;