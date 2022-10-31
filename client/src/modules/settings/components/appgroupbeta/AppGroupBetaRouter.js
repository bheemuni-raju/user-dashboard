import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import AppGroupBetaList from './AppGroupBetaList.js';
import AssignUnssignBetaGroup from './AssignUnssignBetaGroup';
import AppGroupBetaUserList from './AppGroupBetaUserList';
import requireRole from "components/router/requireRole";
import { settings } from 'lib/permissionList';

const canViewAppGroup = requireRole(settings.viewAppGroup);
const canEditAppGroupUsers = requireRole(settings.editAppGroupUsers);

const AppGroupRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewAppGroup(AppGroupBetaList)} />
        <Route path={`${match.url}/:appGroupName/users`} exact component={canEditAppGroupUsers(AppGroupBetaUserList)} />
        <Route path={`${match.url}/:appGroupName/assign`} exact component={canEditAppGroupUsers(AssignUnssignBetaGroup)} />
        <Route path={`${match.url}/:appGroupName/unassign`} exact component={canEditAppGroupUsers(AssignUnssignBetaGroup)} />
    </SwitchWithNotFound>
);

export default AppGroupRouter;
