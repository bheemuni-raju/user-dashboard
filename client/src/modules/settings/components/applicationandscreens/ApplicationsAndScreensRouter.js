import React from 'react'
import { Route } from 'react-router-dom'

import { permissionModule } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound'

import ApplicationList from './components/ApplicationList'
import PermissionModuleCreate from './components/PermissionModuleCreate'
import PermissionModuleEdit from './components/PermissionModuleEdit'

const canViewPermissionModule = requireRole([permissionModule.viewPermissionModule])
const canCreatePermissionModule = requireRole([permissionModule.createPermissionModule])
const canEditPermissionModule = requireRole([permissionModule.editPermissionModule])

const PermissionTemplateRouter = ({ match }) =>
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={ApplicationList} />
        <Route path={`${match.url}/create/:appName`} exact component={PermissionModuleCreate} />
        <Route path={`${match.url}/:moduleId/edit/:appName`} exact component={PermissionModuleEdit} />
    </SwitchWithNotFound>

export default PermissionTemplateRouter;