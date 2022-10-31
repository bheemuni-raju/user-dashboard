import React from 'react';
import { Route } from 'react-router-dom';

import { user, hierarchy } from 'lib/permissionList';
import requireRole from "components/router/requireRole";

import Home from '../core/components/Home';
import UserList from './components/UserList';
import Callback from './components/Callback';
import UserDashboard from './components/UserDashboard';
import UserCreate from './components/UserCreate';
import UserEdit from './components/UserEdit';
import SwitchWithNotFound from '../../components/router/SwitchWithNotFound';
import ConfirmNewAccount from './components/ConfirmNewAccount';

const canViewUserProfile = requireRole(user.viewUserProfile);
const canCreateUserProfile = requireRole(user.createUserProfile);
const canEditUserProfile = requireRole(user.editUserProfile);

const UserRouter = ({ match }) => (
  <SwitchWithNotFound>
    <Route path={match.url} exact component={Home} />
    <Route path={`${match.url}/callback`} exact component={Callback} />
    <Route path={`${match.url}/confirm-new-account`} exact component={ConfirmNewAccount} />
    <Route path={`${match.url}/dashboard`} exact component={canViewUserProfile(UserDashboard)} />
    <Route path={`${match.url}/list`} exact component={canViewUserProfile(UserList)} />

    <Route path={`${match.url}/create`} exact component={canCreateUserProfile(UserCreate)} />
    <Route path={`${match.url}/master/:email/:department/edit`} exact component={canEditUserProfile(UserEdit)} />
    <Route path={`${match.url}/master/:email//edit`} exact component={canEditUserProfile(UserEdit)} />

  </SwitchWithNotFound>
);

export default UserRouter;
