import { get, flattenDeep, remove, difference, size, concat } from 'lodash';
import { batch, hierarchy, group, businessDevelopment, userExperience, supplyChain, finance, settings, analytics, user, deploymentRequest, permissionTemplate, permissionModule, appToken, assignmentRule, maintenance } from 'lib/permissionList';

export const navConfig = (user) => {
  const dashboard = getDashboardItems() || [];
  let allItems = flattenDeep([
    ...dashboard
  ]);

  const allPermissions = get(user, 'permissions');

  allItems = allItems.map((item) => {
    let { permission: itemPermission, children } = item;
    let childrenArray = [];

    /**If childrens are there, render them based on permissions */
    if (children) {
      childrenArray = children.map((child) => {
        let { permission: childPermission } = child;

        if (childPermission && childPermission.length) {
          const diffCount = size(difference(childPermission, allPermissions));
          const isValid = (diffCount === 0);
          return isValid ? child : null;
        }
        return child;
      });
    }
    /**Removing null items */
    remove(childrenArray, n => !n);

    children && (item["children"] = childrenArray);
    /**If childrens has permission, render them based on permissions */
    if (itemPermission && itemPermission.length) {
      const diffCount = size(difference(itemPermission, allPermissions));
      /**If one or more permission is matching render the component */
      const isValid = (diffCount >= 0 && diffCount < itemPermission.length);
      return isValid ? item : null;
    }
    return item;
  })

  /**Removing null items */
  remove(allItems, n => !n);

  return {
    items: allItems
  }
};

const getDashboardItems = () => {

  const viewAppUsers = [
    analytics.viewApplicationUser
  ];
  const viewAppRoles = [
    analytics.viewApplicationRole
  ];
  const viewDrs = [
    deploymentRequest.viewDeploymentRequest
  ];
  const viewAnalytics = concat(viewAppUsers, viewAppRoles, viewDrs);

  const viewBD = [
    businessDevelopment.viewBDEmployees,
    businessDevelopment.viewBDSummary
  ];

  const viewUX = [
    userExperience.viewUxEmployees
  ];

  const viewSCEmployees = [
    supplyChain.viewScEmployees,
    supplyChain.viewScSummary
  ];
  const viewSCAttendance = [
    supplyChain.viewScAttendancePortal,
    supplyChain.viewScAttendanceWorkflow,
    supplyChain.viewScTalktime,
    supplyChain.viewScDayOff,
    supplyChain.viewScAttendanceSummary
  ];
  const viewSC = concat(viewSCEmployees, viewSCAttendance);

  const viewFinance = [
    finance.viewFinanceEmployees
  ];

  const viewReport = [
    batch.viewReports
  ];
  const viewUpload = [
    batch.viewUploads
  ];
  const viewJob = [
    batch.viewJobs
  ];
  const viewBatch = concat(viewReport, viewUpload, viewJob);

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
  ]
  const viewSettings = concat(viewMaster, viewHierarchy, viewGroups, viewAssignmentRule, viewPermissions, viewScreens, viewAppToken, viewAppUser, viewAppRole, viewAppGroup, viewCacheConfig, viewAppConfig, viewGridConfig);

  return [{
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'bjs-dashboard',
    badge: {
      variant: 'info',
      text: 'NEW',
    }
  },
  {
    name: 'Analytics',
    url: '/analytics',
    icon: 'bjs-ums-analytics',
    permission: viewAnalytics
  },
  {
    name: 'Business Development',
    url: '/business-development',
    icon: 'bjs-sales-dashboard',
    permission: viewBD
  },
  {
    name: 'User Experience',
    url: '/user-experience',
    icon: 'bjs-ux-dashboard-01',
    permission: viewUX
  }, {
    name: 'Supply Chain',
    url: '/supply-chain',
    icon: 'bjs-sc-dashboard',
    permission: viewSC
  }, {
    name: 'Finance',
    url: '/finance',
    icon: 'bjs-finance-dashboard1',
    permission: viewFinance
  }, {
    name: 'Reports and Jobs',
    url: '/batch',
    icon: 'bjs-reports-and-jobs',
    permission: viewBatch
  }, {
    name: 'Settings',
    url: '/settings',
    icon: 'bjs-settings',
    permission: viewSettings
  }]
}

export default navConfig;