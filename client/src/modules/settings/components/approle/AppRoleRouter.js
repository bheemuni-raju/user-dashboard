import React from 'react'
import { Route } from 'react-router-dom'

import { settings } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound'

import AppRoleList from './components/AppRoleList'
import AppRoleCreate from './components/AppRoleCreate'
import AppRoleEdit from './components/AppRoleEdit'
import AppRoleClone from './components/AppRoleClone'

const canViewAppRole = requireRole(settings.viewAppRole);
const canCreateAppRole = requireRole(settings.createAppRole);
const canEditAppRole = requireRole(settings.editAppRole);
const canCloneAppRole = requireRole(settings.cloneAppRole);

const AppRoleRouter = ({ match }) =>
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewAppRole(AppRoleList)} />
        <Route path={`${match.url}/create`} exact component={canCreateAppRole(AppRoleCreate)} />
        <Route path={`${match.url}/:appRoleFormattedName/edit`} exact component={canEditAppRole(AppRoleEdit)} />
        <Route path={`${match.url}/:appRoleFormattedName/clone`} exact component={canCloneAppRole(AppRoleClone)} />
    </SwitchWithNotFound>

export default AppRoleRouter;