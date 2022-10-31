import React from 'react'
import { Route } from 'react-router-dom'

import { permissionTemplate } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound'

import PermissionTemplateList from './components/PermissionTemplateList'
import PermissionTemplate from './components/PermissionTemplate'
import AssignUnassignPermissionTemplate from './components/AssignUnassignPermissionTemplate'

import PermissionTemplateCreate from './components/PermissionTemplateCreate'
import PermissionTemplateClone from './components/PermissionTemplateClone'
import PermissionTemplateEdit from './components/PermissionTemplateEdit'

const canViewPermissionTemplate = requireRole(permissionTemplate.viewPermissionTemplate);
const canCreatePermissionTemplate = requireRole(permissionTemplate.createPermissionTemplate);
const canEditPermissionTemplate = requireRole(permissionTemplate.editPermissionTemplate);
const canClonePermissionTemplate = requireRole(permissionTemplate.clonePermissionTemplate);
const canShowUserPermissionTemplate = requireRole(permissionTemplate.showUsersPermissionTemplate);

const PermissionTemplateRouter = ({ match }) =>
  <SwitchWithNotFound>
    <Route path={`${match.url}`} exact component={canViewPermissionTemplate(PermissionTemplateList)} />
    <Route path={`${match.url}/create`} exact component={canCreatePermissionTemplate(PermissionTemplateCreate)} />
    <Route path={`${match.url}/:templateId`} exact component={canShowUserPermissionTemplate(PermissionTemplate)} />
    <Route path={`${match.url}/:templateId/assign`} exact component={canShowUserPermissionTemplate(AssignUnassignPermissionTemplate)} />
    <Route path={`${match.url}/:templateId/unassign`} exact component={canShowUserPermissionTemplate(AssignUnassignPermissionTemplate)} />
    <Route path={`${match.url}/:templateId/clone`} exact component={canClonePermissionTemplate(PermissionTemplateClone)} />
    <Route path={`${match.url}/:templateId/edit`} exact component={canEditPermissionTemplate(PermissionTemplateEdit)} />
  </SwitchWithNotFound>

export default PermissionTemplateRouter;