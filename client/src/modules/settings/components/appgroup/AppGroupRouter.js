import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import AppGroupList from './AppGroupList.js';
import AssignUnassignGroup from './AssignUnssignGroup';
import AppGroupUserList from './AppGroupUserList';
import requireRole from "components/router/requireRole";
import { settings } from 'lib/permissionList';

const canViewAppGroup = requireRole(settings.viewAppGroup);
const canEditAppGroupUsers = requireRole(settings.editAppGroupUsers);

const AppGroupRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewAppGroup(AppGroupList)} />
        <Route path={`${match.url}/:appGroupName/edit`} exact component={canEditAppGroupUsers(AppGroupUserList)} />
        <Route path={`${match.url}/:appGroupName/assign`} exact component={canEditAppGroupUsers(AssignUnassignGroup)} />
        <Route path={`${match.url}/:appGroupName/unassign`} exact component={canEditAppGroupUsers(AssignUnassignGroup)} />
    </SwitchWithNotFound>
);

export default AppGroupRouter;
