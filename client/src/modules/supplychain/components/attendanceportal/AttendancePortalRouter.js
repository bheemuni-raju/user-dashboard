import React from 'react';
import { Route } from 'react-router-dom';

import { supplyChain } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import AttendanceList from './components/attendance/AttendanceList';
import AttendanceWorkflowList from './components/workflow/WorkflowList';
import TalkTimeList from './components/talktime/TalkTimeList';
import DayOffList from './components/dayoff/DayOffList';
import AttendanceSummary from './components/attendancedashboard/ScAttendanceSummary';

const canViewScAttendancePortal = requireRole([supplyChain.viewScAttendancePortal]);
const canViewScAttendanceWorkflow = requireRole([supplyChain.viewScAttendanceWorkflow]);
const canViewScTalktime = requireRole([supplyChain.viewScTalktime]);
const canViewScDayOff = requireRole([supplyChain.viewScDayOff]);
const canViewScAttendanceSummary = requireRole([supplyChain.viewScAttendanceSummary]);

const AttendanceRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}/attendance`} exact component={canViewScAttendancePortal(AttendanceList)} />
        <Route path={`${match.url}/attendance-workflow`} exact component={canViewScAttendanceWorkflow(AttendanceWorkflowList)} />
        <Route path={`${match.url}/talktime`} exact component={canViewScTalktime(TalkTimeList)} />
        <Route path={`${match.url}/day-off`} exact component={canViewScDayOff(DayOffList)} />
        <Route path={`${match.url}/sc-attendance-summary`} exact component={canViewScAttendanceSummary(AttendanceSummary)} />
    </SwitchWithNotFound>
);

export default AttendanceRouter;

