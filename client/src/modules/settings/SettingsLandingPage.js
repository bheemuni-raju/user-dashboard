import React from "react";
import { connect } from 'react-redux';

import CardLayout from "components/CardLayout";
import { user, group, permissionTemplate, permissionModule, hierarchy, settings, validatePermission, maintenance, assignmentRule, appToken, setup, communication } from 'lib/permissionList';

const SettingsLandingPage = (props) => {
    const viewDepartment = [hierarchy.viewDepartment];
    const viewDepartmentGrid = validatePermission(props.user, viewDepartment);

    const viewSubDepartment = [hierarchy.viewSubDepartment];
    const viewSubDepartmentGrid = validatePermission(props.user, viewSubDepartment);

    const viewUnit = [hierarchy.viewUnit];
    const viewUnitGrid = validatePermission(props.user, viewUnit);

    const viewVertical = [hierarchy.viewVertical];
    const viewVerticalGrid = validatePermission(props.user, viewVertical);

    const viewCampaign = [hierarchy.viewCampaign];
    const viewCampaignGrid = validatePermission(props.user, viewCampaign);

    const viewCity = [hierarchy.viewCity];
    const viewCityGrid = validatePermission(props.user, viewCity);

    const viewCountry = [hierarchy.viewCountry];
    const viewCountryGrid = validatePermission(props.user, viewCountry);

    const viewOrganization = [setup.viewOrganization];
    const viewOrganizationGrid = validatePermission(props.user, viewOrganization);

    const viewRole = [hierarchy.viewRole];
    const viewRoleGrid = validatePermission(props.user, viewRole);

    const viewLanguage = [hierarchy.viewLanguage];
    const viewLanguageGrid = validatePermission(props.user, viewLanguage);

    const viewPermissionTemplate = [permissionTemplate.viewPermissionTemplate];
    const viewPermissionTemplateGrid = validatePermission(props.user, viewPermissionTemplate);

    const viewPermissionModule = [permissionModule.viewPermissionModule];
    const viewPermissionModuleGrid = validatePermission(props.user, viewPermissionModule);

    const viewGroup = [group.viewGroup];
    const viewGroupGrid = validatePermission(props.user, viewGroup);

    const viewAssignmentRule = [assignmentRule.viewAssignmentRule];
    const viewAssignmentRuleGrid = validatePermission(props.user, viewAssignmentRule);

    const viewAppToken = [appToken.viewAppToken];
    const viewAppTokenGrid = validatePermission(props.user, viewAppToken);

    const viewAppUser = [settings.viewAppUser];
    const viewAppUserGrid = validatePermission(props.user, viewAppUser);

    const viewAppRole = [settings.viewAppRole];
    const viewAppRoleGrid = validatePermission(props.user, viewAppRole);

    const viewAppGroup = [settings.viewAppGroup];
    const viewAppGroupGrid = validatePermission(props.user, viewAppGroup);

    let viewCacheConfig = [maintenance.viewCacheConfig];
    const viewCacheConfigGrid = validatePermission(props.user, viewCacheConfig);

    let viewAppConfig = [maintenance.viewAppConfig];
    const viewAppConfigGrid = validatePermission(props.user, viewAppConfig);

    let viewGridConfig = [maintenance.viewGridConfig];
    const viewGridConfigGrid = validatePermission(props.user, viewGridConfig);

    const viewUserProfile = [user.viewUserProfile];
    const viewUserProfileGrid = validatePermission(props.user, viewUserProfile);

    const viewSmsTemplates = [communication.viewSmsTemplates];
    const viewSmsTemplatesGrid = validatePermission(props.user, viewSmsTemplates);

    const viewSmsProvider = [communication.viewSmsProvider];
    const viewSmsProviderGrid = validatePermission(props.user, viewSmsProvider);

    const viewPlaceholder = [communication.viewPlaceholder];
    const viewPlaceholderGrid = validatePermission(props.user, viewPlaceholder);

    const viewSmsTransaction = [communication.viewSmsTransaction];
    const viewSmsTransactionGrid = validatePermission(props.user, viewSmsTransaction)

    const cards = [{
        title: 'Setup',
        items: [{
            title: 'Departments',
            url: '/settings/setup/departments',
            icon: 'bjs-department',
            isAllowed: viewDepartmentGrid
        }, {
            title: 'Subdepartments',
            url: '/settings/setup/subdepartments',
            icon: 'bjs-sub-department',
            isAllowed: viewSubDepartmentGrid
        }, {
            title: 'Units',
            url: '/settings/setup/units',
            icon: 'bjs-hierarchy-setup-icon',
            isAllowed: viewUnitGrid
        }, {
            title: 'Verticals',
            url: '/settings/setup/verticals',
            icon: 'bjs-verticals',
            isAllowed: viewVerticalGrid
        }, {
            title: 'Campaigns',
            url: '/settings/setup/campaigns',
            icon: 'bjs-campaign',
            isAllowed: viewCampaignGrid
        }, {
            title: 'Cities',
            url: '/settings/setup/cities',
            icon: 'bjs-city',
            isAllowed: viewCityGrid
        }, {
            title: 'Countries',
            url: '/settings/setup/countries',
            icon: 'bjs-countries',
            isAllowed: viewCountryGrid
        }, {
            title: 'Organizations',
            url: '/settings/setup/organizations',
            icon: 'bjs-countries',
            isAllowed: viewOrganizationGrid
        }, {
            title: 'Languages',
            url: '/settings/setup/languages',
            icon: 'bjs-countries',
            isAllowed: viewLanguageGrid
        },
        ]
    }, {
        title: 'Configurations',
        items: [{
            title: 'Organization Roles',
            url: '/settings/roles',
            icon: 'bjs-roles',
            isAllowed: viewRoleGrid
        }, {
            title: 'Permission Templates',
            url: '/settings/permission-templates',
            icon: 'bjs-permission-templates',
            isAllowed: viewPermissionTemplateGrid
        }, {
            title: 'Applications & Screens',
            url: '/settings/applications-and-screens',
            icon: 'bjs-application-screen',
            isAllowed: viewAppRoleGrid
        }, {
            title: 'Groups',
            url: '/settings/groups',
            icon: 'bjs-group-setup',
            isAllowed: viewGroupGrid
        }, {
            title: 'Assignment Rules',
            url: '/settings/assignment-rules',
            icon: 'fa fa-gavel',
            isAllowed: viewAssignmentRuleGrid
        }, {
            title: 'App Tokens',
            url: '/settings/app-tokens',
            icon: 'bjs-app-tokens',
            isAllowed: viewAppTokenGrid
        }, {
            title: 'Application Roles',
            url: '/settings/app-roles',
            icon: 'bjs-app-tokens',
            isAllowed: viewAppRoleGrid
        }, {
            title: 'Application Users',
            url: '/settings/app-users',
            icon: 'bjs-app-tokens',
            isAllowed: viewAppUserGrid
        }, {
            title: 'Application Groups',
            url: '/settings/app-groups',
            icon: 'bjs-app-tokens',
            isAllowed: viewAppGroupGrid
        }, {
            icon: "bjs-cache-configuration",
            title: "Cache Configuration",
            url: '/settings/cache-configuration',
            isAllowed: viewCacheConfigGrid
        }, {
            icon: "bjs-oms-app-configuration-icon",
            title: 'App Configuration',
            url: '/settings/app-configuration',
            isAllowed: viewAppConfigGrid
        }, {
            icon: "bjs-grid-template",
            title: "Grid Configuration",
            url: '/settings/grid-configuration',
            isAllowed: viewGridConfigGrid
        }, {
            icon: "fa fa-caret-square-o-down",
            title: "Enum Configuration",
            url: '/settings/enum-configuration',
            isAllowed: viewGridConfigGrid
        },
        {
            icon: "fa fa-caret-square-o-down",
            title: "Devops Configuration",
            url: '/settings/devops-infra-configuration',
            isAllowed: viewGridConfigGrid //viewGridConfigGrid
        }]
    }, {
        title: 'Monitoring',
        items: [{
            title: 'Master Employees',
            url: '/settings/master-employees',
            icon: 'bjs-loan-masters',
            isAllowed: viewUserProfileGrid
        }]
    }, {
        title: 'Manage Communications',
        items: [{
            title: 'Template Placeholders',
            url: '/settings/placeholder',
            icon: 'bjs-loan-masters',
            isAllowed: viewPlaceholderGrid
        }, {
            title: 'SMS Provider',
            url: '/settings/sms-provider',
            icon: 'bjs-loan-masters',
            isAllowed: viewSmsProviderGrid
        }, {
            title: 'SMS Templates',
            url: '/settings/sms-templates',
            icon: 'bjs-loan-masters',
            isAllowed: viewSmsTemplatesGrid
        }, {
            title: "SMS Transactions",
            url: '/settings/sms-transactions',
            icon: "bjs-sms-templete",
            isAllowed: viewSmsTransactionGrid
        }]
    }, {
        title: 'Beta Setup',
        items: [{
            title: 'Departments',
            url: '/settings/setup-beta/departments',
            icon: 'bjs-department',
            isAllowed: viewDepartmentGrid
        }, {
            title: 'Subdepartments',
            url: '/settings/setup-beta/subdepartments',
            icon: 'bjs-sub-department',
            isAllowed: viewSubDepartmentGrid
        }, {
            title: 'Units',
            url: '/settings/setup-beta/units',
            icon: 'bjs-hierarchy-setup-icon',
            isAllowed: viewUnitGrid
        }, {
            title: 'Verticals',
            url: '/settings/setup-beta/verticals',
            icon: 'bjs-verticals',
            isAllowed: viewVerticalGrid
        }, {
            title: 'Campaigns',
            url: '/settings/setup-beta/campaigns',
            icon: 'bjs-campaign',
            isAllowed: viewCampaignGrid
        }, {
            title: 'Cities',
            url: '/settings/setup-beta/cities',
            icon: 'bjs-city',
            isAllowed: viewCityGrid
        }, {
            title: 'Countries',
            url: '/settings/setup-beta/countries',
            icon: 'bjs-countries',
            isAllowed: viewCountryGrid
        }, {
            title: 'Organizations',
            url: '/settings/setup-beta/organizations',
            icon: 'bjs-countries',
            isAllowed: viewOrganizationGrid
        }, {
            title: 'Application Groups',
            url: '/settings/v1/app-groups',
            icon: 'fa fa-group',
            isAllowed: viewAppGroupGrid
        }]
    }, {
        title: 'Beta Configurations',
        items: [{
            title: 'Organization Roles',
            url: '/settings/configuration-beta/roles',
            icon: 'bjs-roles',
            isAllowed: viewRoleGrid
        }, {
            title: 'Applications & Screens',
            url: '/settings/v1/applications-and-screens',
            icon: 'bjs-application-screen',
            isAllowed: viewAppRoleGrid
        }, {
            title: 'Application Roles',
            url: '/settings/configuration-beta/app-roles',
            icon: 'bjs-app-tokens',
            isAllowed: viewAppRoleGrid
        }, {
            title: 'Application Groups',
            url: '/settings/configuration-beta/app-groups',
            icon: 'bjs-app-tokens',
            isAllowed: viewAppGroupGrid
        }],
    }];

    return (
        <CardLayout cards={cards} heading="Settings" />
    );
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(SettingsLandingPage)
