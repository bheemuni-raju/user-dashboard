import React from 'react';
import { Route } from 'react-router-dom';

import { hierarchy } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import ConfigurationGrids from './components/ConfigurationDashboard';
import RoleList from './components/roles/RoleList';
import AppRoleRouter from "./components/approle/AppRoleRouter";
import AppGroupRouter from"./components/appgroup/AppGroupRouter";

const canViewConfigurationGrids = requireRole(hierarchy.viewRole);
const canViewRoleGrid = requireRole(hierarchy.viewRole);

const ConfigurationRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewConfigurationGrids(ConfigurationGrids)} />
        <Route path={`${match.url}/roles`} exact component={canViewRoleGrid(RoleList)} />
        <Route path={`${match.url}/app-roles`} component={AppRoleRouter} />
        <Route path={`${match.url}/app-groups`} component={AppGroupRouter} />
    </SwitchWithNotFound>
);

export default ConfigurationRouter;

