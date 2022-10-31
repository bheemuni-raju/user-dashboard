import React from "react";
import { Route } from "react-router-dom";
import { concat } from 'lodash';

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { analytics, semantic, deploymentRequest, secret, security, vault, vaultRole ,npgexemplumMigration, dataSeeding} from 'lib/permissionList';
import AnalyticsLandingPage from './AnalyticsLandingPage';
import ApplicationUsersList from './components/ApplicationUsersList';
import ApplicationRolesList from './components/ApplicationRolesList';
import DeploymentRequestList from './components/devopsinfrarequest/List';
import SecretRouter from './components/secretpool/SecretRouter';
import VaultUserGroupMappingRouter from "./components/vaultusergroupmapping/VaultUserGroupMappingRouter";
import VaultManagementRouter from './components/vaultmanagement/VaultManagementRouter';
import SecurityReportList from './components/securitymanagement/List';
import VaultLogRouter from './components/vaultlog/VaultLogRouter'
import VaultAuditRouter from './components/vaultaudit/VaultAuditRouter'
import AppGroupRouter from '../../modules/settings/components/appgroup/AppGroupRouter'
import DatabaseMigrationRouter from './components/databasemigration/DatabaseMigrationRouter'
import DataSeedingRouter from './components/databaseseeding/DatabaseSeedingRouter'
import SemanticConfigList from "./components/semanticversionconfiguration/semanticconfig/SemanticConfigList";
import ApplicationTypeList from "./components/semanticversionconfiguration/applicationtype/ApplicationTypeList";
import EnvironmentList from "./components/semanticversionconfiguration/environment/EnvironmentList";
import NotificationChannel from "./components/semanticversionconfiguration/notificationchannel/NotificationChannel";

const viewAppUsers = [analytics.viewApplicationUser];
const viewAppRoles = [analytics.viewApplicationRole];
const viewDrs = [deploymentRequest.viewDeploymentRequest];
const viewAnalytics = concat(viewAppUsers, viewAppRoles, viewDrs);
const canViewAnalyticsLandingPage = requireRole(viewAnalytics);
const canViewApplicationUsersGrid = requireRole([analytics.viewApplicationUser]);
const canViewApplicationRolesGrid = requireRole([analytics.viewApplicationRole]);
const canViewDrGrid = requireRole([deploymentRequest.viewDeploymentRequest]);
const canViewSecret = requireRole(secret.viewSecret);
const canViewVault =requireRole(vault.viewVault);
const canViewVaultRoleMappingg =requireRole(vaultRole.viewVaultRole);
const canViewVaultLog =requireRole(secret.viewSecret);
const canViewSemanticConfigGrid = requireRole(semantic.viewSemanticConfig)
const canViewSemanticAppTypeGrid = requireRole(semantic.viewApplicationType)
const canViewSemanticEnvironmentGrid = requireRole(semantic.viewEnvironmentType)
const canViewNotificationChannelGrid = requireRole(semantic.viewNotificationChannel)
const viewSecurityReport = requireRole(security.viewReport);
const canViewNpgexemplumMigration =requireRole (npgexemplumMigration.viewNpgexemplumMigration);
const canViewDataSeeding =requireRole (dataSeeding.viewDataSeeding);

const AnalyticsRouter = ({ match }) => {
    const isImpersonated = window.localStorage.getItem('x-impersonated-email');

    return (
        <SwitchWithNotFound>
            <Route path={`${match.url}`} exact component={canViewAnalyticsLandingPage(AnalyticsLandingPage)} />
            <Route path={`${match.url}/application-users`} exact component={canViewApplicationUsersGrid(ApplicationUsersList)} />
            <Route path={`${match.url}/application-roles`} exact component={canViewApplicationRolesGrid(ApplicationRolesList)} />
            <Route path={`${match.url}/vault-user-group-mapping`} component={canViewVaultRoleMappingg(VaultUserGroupMappingRouter)} />
            <Route path={`${match.url}/vault`} component={canViewVault(VaultManagementRouter)} />
            <Route path={`${match.url}/sub-vaults`}  component={canViewSecret(SecretRouter)} />  
            <Route path={`${match.url}/vault-log`}  component={canViewVaultLog(VaultLogRouter)} />
            <Route path={`${match.url}/user-groups`}  component={canViewVaultLog(AppGroupRouter)} />
            <Route path={`${match.url}/vault-audit`}  component={canViewVaultLog(VaultAuditRouter)} />
            <Route path={`${match.url}/semantic-configuration`}  component={canViewSemanticConfigGrid(SemanticConfigList)} />
            <Route path={`${match.url}/application-type`}  component={canViewSemanticAppTypeGrid(ApplicationTypeList)} />
            <Route path={`${match.url}/environment`}  component={canViewSemanticEnvironmentGrid(EnvironmentList)} />
            <Route path={`${match.url}/notification-channel`}  component={canViewNotificationChannelGrid(NotificationChannel)} />
            <Route path={`${match.url}/security-report`}  component={viewSecurityReport(SecurityReportList)} />
            <Route path={`${match.url}/migrations-meta`}  component={canViewNpgexemplumMigration(DatabaseMigrationRouter)} />
            <Route path={`${match.url}/migrations-data`}  component={canViewDataSeeding(DataSeedingRouter)} />
            {/**Don't render Deployment Request Router if its impersonated profile */}
            {!isImpersonated && <Route path={`${match.url}/devops-infra-requests`} component={canViewDrGrid(DeploymentRequestList)} />}
        </SwitchWithNotFound>
    )
};

export default AnalyticsRouter;