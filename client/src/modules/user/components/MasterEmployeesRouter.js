import React from "react";
import { Route } from "react-router-dom";

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { user } from 'lib/permissionList';

import UserDashboard from 'modules/user/components/UserDashboard';
import UserCreate from 'modules/user/components/UserCreate';
import UserEdit from 'modules/user/components/UserEdit';
import UserList from 'modules/user/components/UserList';

const canViewMasterGrid = requireRole(user.viewUserProfile);
const canCreateUserProfile = requireRole(user.createUserProfile);
const canEditUserProfile = requireRole(user.editUserProfile);

const MasterEmployeesRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewMasterGrid(UserDashboard)} />
        <Route path={`${match.url}/list`} exact component={canViewMasterGrid(UserList)} />
        <Route path={`${match.url}/create`} exact component={canCreateUserProfile(UserCreate)} />
        <Route path={`${match.url}/:email/:department/edit`} exact component={canEditUserProfile(UserEdit)} />
        <Route path={`${match.url}/:email/edit`} exact component={canEditUserProfile(UserEdit)} />
    </SwitchWithNotFound>
);

export default MasterEmployeesRouter;