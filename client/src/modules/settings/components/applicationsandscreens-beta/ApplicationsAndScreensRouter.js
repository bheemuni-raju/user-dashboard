import React from 'react'
import { Route } from 'react-router-dom'

import SwitchWithNotFound from 'components/router/SwitchWithNotFound'

import ApplicationList from './components/ApplicationList'
import PermissionCreate from './components/PermissionCreate'
import PermissionEdit from './components/PermissionEdit'

const ApplicationsAndScreensRouter = ({ match }) =>
  <SwitchWithNotFound>
    <Route path={`${match.url}`} exact component={ApplicationList} />
    <Route path={`${match.url}/create/:appName`} exact component={PermissionCreate} />
    <Route path={`${match.url}/:permissionId/edit/:appName`} exact component={PermissionEdit} />
  </SwitchWithNotFound>

export default ApplicationsAndScreensRouter;