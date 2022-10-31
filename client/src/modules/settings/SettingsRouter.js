import React from "react";
import { Route } from "react-router-dom";

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { group, settings, hierarchy, setup, assignmentRule, appToken, permissionTemplate, permissionModule, user, maintenance, communication } from 'lib/permissionList';
import { concat } from 'lodash';

import SettingsLandingPage from './SettingsLandingPage';
import PermissionTemplateRouter from "./components/permissiontemplates/PermissionTemplateRouter";
import AppRoleRouter from "./components/approle/AppRoleRouter";
import ApplicationsAndScreensRouter from "./components/applicationandscreens/ApplicationsAndScreensRouter";
import ApplicationsAndScreensRouterV2 from "./components/applicationsandscreens-beta/ApplicationsAndScreensRouter";
import HierarchyRouter from './components/hierarchy/HierarchyRouter';
import HierarchyBetaRouter from './components/hierarchy-beta/HierarchyRouter';
import MasterEmployeesRouter from 'modules/user/components/MasterEmployeesRouter';
import ConfigurationBetaRouter from './components/configuration-beta/ConfigurationRouter';

import RoleList from './components/roles/RoleList';
import GroupList from "./components/group/GroupGrid";
import AppTokenList from './components/apptoken/AppTokenList';
import AppUserList from './components/appuser/AppUserList';
import AppGroupRouter from './components/appgroup/AppGroupRouter';
import AssignmentRuleRouter from "./components/assignmentrule/AssignmentRuleRouter";
import CreateAppUserModal from './components/appuser/CreateAppUserModal';
import CacheConfiguration from './components/cacheconfiguration/CacheClear';
import AppGroupBetaRouter from './components/appgroupbeta/AppGroupBetaRouter';

import AppConfiguration from './components/ConfigurationList';
import GridConfiguration from './components/GridTemplateList';
import CreateGridTemplate from './components/CreateGridTemplate';
import EditGridTemplate from './components/EditGridTemplate';
import SmsTransactionList from './components/communication/smstransactions/SmsTransactionList';

import DevopsConfigList from './components/devopsinfra/ConfigList';

import EnumList from './components/enum/EnumList';

import SmsTemplates from './components/communication/smstemplates/SmsTemplateList';
import TemplatePlaceholder from './components/communication/placeholder/PlaceholderList';
import SmsProviderList from './components/communication/smsprovider/SmsProviderList';

const viewMaster = [
    user.viewUserProfile
];
const viewHierarchy = [
    hierarchy.viewDepartment,
    hierarchy.viewSubDepartment,
    hierarchy.viewUnit,
    hierarchy.viewVertical,
    hierarchy.viewCampaign,
    hierarchy.viewCity,
    hierarchy.viewCountry,
    hierarchy.viewRole,
    hierarchy.viewTeam
];
const viewOrganization = [
    setup.viewOrganization
];
const viewPermissions = [
    permissionTemplate.viewPermissionTemplate
];
const viewScreens = [
    permissionModule.viewPermissionModule
];
const viewGroups = [
    group.viewGroup
];
const viewAssignmentRule = [
    assignmentRule.viewAssignmentRule
];
const viewAppToken = [
    appToken.viewAppToken
];
const viewAppRole = [
    settings.viewAppRole
];
const viewAppUser = [
    settings.viewAppUser
];
const viewAppGroup = [
    settings.viewAppGroup
];
const viewCacheConfig = [
    maintenance.viewCacheConfig
];
const viewAppConfig = [
    maintenance.viewAppConfig
];
const viewGridConfig = [
    maintenance.viewGridConfig
];

const viewSettings = concat(viewMaster, viewHierarchy, viewOrganization, viewGroups, viewAssignmentRule, viewPermissions, viewScreens, viewAppToken, viewAppUser, viewAppRole, viewAppGroup, viewCacheConfig, viewAppConfig, viewGridConfig);
const canViewSettingsLandingPage = requireRole(viewSettings);

const canViewGroupGrid = requireRole(viewGroups);
const canViewRoleGrid = requireRole(hierarchy.viewRole);
const canViewAppToken = requireRole(viewAppToken);

const canViewAppUser = requireRole(settings.viewAppUser);
const canCreateAppUser = requireRole(settings.createAppUser);
const canEditAppUser = requireRole(settings.editAppUser);

const canViewCacheConfig = requireRole(viewCacheConfig);
const canViewAppConfig = requireRole(viewAppConfig);
const canViewGridConfig = requireRole(maintenance.viewGridConfig);
const canCreateGridConfig = requireRole(maintenance.createGridConfig);
const canEditGridConfig = requireRole(maintenance.editGridConfig);
const canViewSmsTransactions = requireRole(communication.viewSmsTransaction)

const canViewSmsTemplates = requireRole(communication.viewSmsTemplates);
const canViewPlaceholder = requireRole(communication.viewPlaceholder);
const canViewSmsProvider = requireRole(communication.viewSmsProvider);

const SettingsRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewSettingsLandingPage(SettingsLandingPage)} />
        <Route path={`${match.url}/permission-templates`} component={PermissionTemplateRouter} />
        <Route path={`${match.url}/applications-and-screens`} component={ApplicationsAndScreensRouter} />
        <Route path={`${match.url}/v1/applications-and-screens`} component={ApplicationsAndScreensRouterV2} />
        <Route path={`${match.url}/setup`} component={HierarchyRouter} />
        <Route path={`${match.url}/setup-beta`} component={HierarchyBetaRouter} />
        <Route path={`${match.url}/groups`} component={canViewGroupGrid(GroupList)} />
        <Route path={`${match.url}/roles`} component={canViewRoleGrid(RoleList)} />
        <Route path={`${match.url}/configuration-beta`} component={ConfigurationBetaRouter} />
        <Route path={`${match.url}/assignment-rules`} component={AssignmentRuleRouter} />
        <Route path={`${match.url}/app-tokens`} component={canViewAppToken(AppTokenList)} />
        <Route path={`${match.url}/app-roles`} component={AppRoleRouter} />

        <Route path={`${match.url}/create-user`} component={canCreateAppUser(CreateAppUserModal)} />
        <Route path={`${match.url}/app-users/create-user`} component={canCreateAppUser(CreateAppUserModal)} />
        <Route path={`${match.url}/app-users/:appRoleName`} component={canEditAppUser(AppUserList)} />
        <Route path={`${match.url}/app-users`} component={canViewAppUser(AppUserList)} />

        <Route path={`${match.url}/app-groups`} component={AppGroupRouter} />
        <Route path={`${match.url}/cache-configuration`} exact component={canViewCacheConfig(CacheConfiguration)} />
        <Route path={`${match.url}/master-employees`} component={MasterEmployeesRouter} />

        <Route path={`${match.url}/app-configuration`} exact component={canViewAppConfig(AppConfiguration)} />

        <Route path={`${match.url}/grid-configuration`} exact component={canViewGridConfig(GridConfiguration)} />
        <Route path={`${match.url}/grid-configuration/create`} exact component={canCreateGridConfig(CreateGridTemplate)} />
        <Route path={`${match.url}/grid-configuration/edit`} exact component={canEditGridConfig(EditGridTemplate)} />

        <Route path={`${match.url}/enum-configuration`} exact component={canViewGridConfig(EnumList)} />

        {/**Devops configuration related routes */}
        <Route path={`${match.url}/devops-infra-configuration`} exact component={canViewGridConfig(DevopsConfigList)} />

        <Route path={`${match.url}/sms-templates`} exact component={canViewSmsTemplates(SmsTemplates)} />
        <Route path={`${match.url}/sms-templates/:templateId`} exact component={canViewSmsTemplates(SmsTemplates)} />
        <Route path={`${match.url}/placeholder`} exact component={canViewPlaceholder(TemplatePlaceholder)} />
        <Route path={`${match.url}/sms-transactions`} component={canViewSmsTransactions(SmsTransactionList)} />
        <Route path={`${match.url}/sms-provider`} component={canViewSmsProvider(SmsProviderList)} />
        <Route path={`${match.url}/v1/app-groups`} component={AppGroupBetaRouter} />

    </SwitchWithNotFound>
);

export default SettingsRouter;