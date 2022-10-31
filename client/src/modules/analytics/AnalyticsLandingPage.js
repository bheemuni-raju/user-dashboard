import React from "react";
import { connect } from 'react-redux';

import CardLayout from "components/CardLayout";
import { validatePermission,semantic, analytics, deploymentRequest, secret, security, vault, vaultRole,settings ,npgexemplumMigration ,dataSeeding} from 'lib/permissionList';

const AnalyticsLandingPage = (props) => {
    const viewApplicationUsers = validatePermission(props.user, analytics.viewApplicationUser);
    const viewApplicationRoles = validatePermission(props.user, analytics.viewApplicationRole);
    const viewDeploymentRequests = validatePermission(props.user, deploymentRequest.viewDeploymentRequest);
    const isImpersonated = window.localStorage.getItem('x-impersonated-email');
    const viewSecret = [secret.viewSecret];
    const viewVault = [vault.viewVault]
    const viewVaultRoleMapping = [vaultRole.viewVaultRole]
    const viewSecretGrid = validatePermission(props.user, viewSecret);
    const viewVaultGrid = validatePermission(props.user, viewVault);
    const viewVaultRoleMappingGrid = validatePermission(props.user, viewVaultRoleMapping);
    const viewSecurityReport = validatePermission(props.user, security.viewReport);
    const viewAppGroup = [settings.viewAppGroup];
    const viewAppGroupGrid = validatePermission(props.user, viewAppGroup);
    const viewNpgexemplumMigration = [npgexemplumMigration.viewNpgexemplumMigration];
    const viewNpgexemplumMigrationGrid = validatePermission(props.user, viewNpgexemplumMigration);
    const viewDataSeeding =[dataSeeding.viewDataSeeding]
    const viewDataSeedingGrid =validatePermission(props.user, viewDataSeeding);
    const viewSemanticConfig = [semantic.viewSemanticConfig];
    const viewSemanticConfigGrid = validatePermission(props.user, viewSemanticConfig)
    const viewSemanticApplicationType = [semantic.viewApplicationType];
    const viewSemanticApplicationTypeGrid = validatePermission(props.user, viewSemanticApplicationType)
    const viewSemanticEnvironment = [semantic.viewEnvironmentType];
    const viewSemanticEnvironmentGrid = validatePermission(props.user, viewSemanticEnvironment)
    const viewNotificationChannel = [semantic.viewNotificationChannel];
    const viewNotificationChannelGrid = validatePermission(props.user, viewNotificationChannel)

    let cards = [{
        title: 'Manage Employees',
        items: [{
            title: 'Application Users',
            url: '/analytics/application-users',
            icon: 'bjs-sales-employees1',
            isAllowed: viewApplicationUsers
        }, {
            title: 'Application Roles',
            url: '/analytics/application-roles',
            icon: 'bjs-sales-employees1',
            isAllowed: viewApplicationRoles
        }
    ]
    },{
        title: 'Semantic Configuration',
        items: [{
            title: 'Semantic Configuration',
            url: '/analytics/semantic-configuration',
            icon: 'fa fa-code-fork',
            isAllowed: viewSemanticConfigGrid
        },
        {
            title: 'Application Type',
            url: '/analytics/application-type',
            icon: 'fa fa-th-list',
            isAllowed: viewSemanticApplicationTypeGrid
        },
        {
            title: 'Environment',
            url: '/analytics/environment',
            icon: 'fa fa-sitemap',
            isAllowed: viewSemanticEnvironmentGrid
        },
        {
            title: 'Notification Channel',
            url: '/analytics/notification-channel',
            icon: 'fa fa-bell',
            isAllowed: viewNotificationChannelGrid
        }
    ]
    },
    /**Don't render Deployment Request Card if its impersonated profile */
    !isImpersonated && {
        title: 'Manage Requests',
        items: [{
            title: 'Devops Infra Requests',
            url: '/analytics/devops-infra-requests',
            icon: 'fa fa-cloud-download',
            isAllowed: viewDeploymentRequests
        },
        {
            title: 'Migrations Meta',
            url: '/analytics/migrations-meta',
            icon: 'fa fa-database',
            isAllowed: viewNpgexemplumMigrationGrid
        },
        {
            title: 'Migrations Data',
            url: '/analytics/migrations-data',
            icon: 'fa fa-database',
            isAllowed: viewDataSeedingGrid
        }
    ]
    }, {
        title: 'Secret Manager',
        items: [

            {
                title: 'Sub Vaults ',
                url: '/analytics/sub-vaults',
                icon: 'fa fa-user-secret',
                isAllowed: viewSecretGrid

            },
            {
                title: 'Vaults',
                url: '/analytics/vault',
                icon: 'fa fa-lock',
                isAllowed: viewVaultGrid
            },
            {
                title: 'User Groups',
                url: '/analytics/user-groups',
                icon: 'bjs-app-tokens',
                isAllowed: viewAppGroupGrid
            }
        ]
    }, {
        title: 'Security Manager',
        items: [{
            title: 'Security Report',
            url: '/analytics/security-report',
            icon: 'fa fa-file',
            isAllowed: viewSecurityReport
        }]
    }
    ];

    return (
        <CardLayout cards={cards} heading="Analytics" />
    );
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(AnalyticsLandingPage)
