const { get, isArray, intersection } = require("lodash");

module.exports = {
  dashboard: {
    viewUserDashboard: "UMS_DASHBOARD_USER_VIEW",
  },
  semantic: {
    viewSemanticConfig: "UMS_ANALYTICS_SEMANTIC_VERSION_VIEW",
    createSemanticConfig: "UMS_ANALYTICS_SEMANTIC_VERSION_CREATE",
    editSemanticConfig: "UMS_ANALYTICS_SEMANTIC_VERSION_EDIT",
    deleteSemanticConfig: "UMS_ANALYTICS_SEMANTIC_VERSION_DELETE",

    viewApplicationType: "UMS_ANALYTICS_SEMANTIC_APPLICATION_TYPE_VIEW",
    createApplicationType: "UMS_ANALYTICS_SEMANTIC_APPLICATION_TYPE_CREATE",
    editApplicationType: "UMS_ANALYTICS_SEMANTIC_APPLICATION_TYPE_EDIT",
    deleteApplicationType: "UMS_ANALYTICS_SEMANTIC_APPLICATION_TYPE_DELETE",

    viewEnvironmentType: "UMS_ANALYTICS_SEMANTIC_ENVIRONMENT_TYPE_VIEW",
    createEnvironmentType: "UMS_ANALYTICS_SEMANTIC_ENVIRONMENT_TYPE_CREATE",
    editEnvironmentType: "UMS_ANALYTICS_SEMANTIC_ENVIRONMENT_TYPE_EDIT",
    deleteEnvironmentType: "UMS_ANALYTICS_SEMANTIC_ENVIRONMENT_TYPE_DELETE",

    viewNotificationChannel: "UMS_ANALYTICS_NOTIFICATION_CHANNEL_VIEW",
    createNotificationChannel: "UMS_ANALYTICS_NOTIFICATION_CHANNEL_CREATE",
    editNotificationChannel: "UMS_ANALYTICS_NOTIFICATION_CHANNEL_EDIT",
    deleteNotificationChannel: "UMS_ANALYTICS_NOTIFICATION_CHANNEL_DELETE",
  },
  analytics: {
    viewApplicationUser: "UMS_ANALYTICS_APPLICATION_USERS_VIEW",
    createApplicationUser: "UMS_ANAYTICS_APPLICATION_USERS_CREATE",
    editApplicationUser: "UMS_ANAYTICS_APPLICATION_USERS_EDIT",
    deleteApplicationUser: "UMS_ANAYTICS_APPLICATION_USERS_DELETE",

    viewApplicationRole: "UMS_ANALYTICS_APPLICATION_ROLES_VIEW",
    createApplicationRole: "UMS_ANAYTICS_APPLICATION_ROLES_CREATE",
    editApplicationRole: "UMS_ANAYTICS_APPLICATION_ROLES_EDIT",
    deleteApplicationRole: "UMS_ANAYTICS_APPLICATION_ROLES_DELETE",
  },
  deploymentRequest: {
    viewDeploymentRequest: "UMS_ANALYTICS_DEPLOYMENT_REQUEST_VIEW",
    editDeploymentRequest: "UMS_ANALYTICS_DEPLOYMENT_REQUEST_EDIT",
    createDeploymentRequest: "UMS_ANALYTICS_DEPLOYMENT_REQUEST_CREATE",
    rejectDeploymentRequest: "UMS_ANALYTICS_DEPLOYMENT_REQUEST_REJECT",
    smokeTestDeploymentrequest: "UMS_ANALYTICS_DEVOPS_INFRA_REQUEST_SMOKE_TEST",
    approveDeploymentRequest: "UMS_ANALYTICS_DEVOPS_INFRA_REQUEST_APPROVE",
    deployDeploymentRequest: "UMS_ANALYTICS_DEVOPS_INFRA_REQUEST_DEPLOY",
    filterDeploymentRequest: "UMS_ANALYTICS_DEPLOYMENT_REQUEST_FILTER",
  },
  businessDevelopment: {
    viewBDEmployees: "UMS_BUSINESS_DEVELOPMENT_EMPLOYEES_VIEW",
    createBDEmployees: "UMS_BUSINESS_DEVELOPMENT_EMPLOYEES_CREATE",
    editBDEmployees: "UMS_BUSINESS_DEVELOPMENT_EMPLOYEES_EDIT",
    viewBDSummary: "UMS_BUSINESS_DEVELOPMENT_EMPLOYEES_SUMMARY_VIEW",
  },
  userExperience: {
    viewUxEmployees: "UMS_USER_EXPERIENCE_EMPLOYEES_VIEW",
    createUxEmployees: "UMS_USER_EXPERIENCE_EMPLOYEES_CREATE",
    editUxEmployees: "UMS_USER_EXPERIENCE_EMPLOYEES_EDIT",
  },
  supplyChain: {
    viewScEmployees: "UMS_SUPPLY_CHAIN_EMPLOYEES_VIEW",
    createScEmployees: "UMS_SUPPLY_CHAIN_EMPLOYEES_CREATE",
    editScEmployees: "UMS_SUPPLY_CHAIN_EMPLOYEES_EDIT",
    viewScSummary: "UMS_SUPPLY_CHAIN_EMPLOYEES_SUMMARY_VIEW",

    viewScAttendancePortal: "UMS_SUPPLY_CHAIN_ATTENDANCE_PORTAL_VIEW",
    viewScAttendanceWorkflow: "UMS_SUPPLY_CHAIN_ATTENDANCE_WORKFLOW_VIEW",
    viewScTalktime: "UMS_SUPPLY_CHAIN_TALKTIME_VIEW",
    viewScDayOff: "UMS_SUPPLY_CHAIN_DAY_OFF_VIEW",
    viewScAttendanceSummary: "UMS_SUPPLY_CHAIN_ATTENDANCE_SUMMARY_VIEW",
  },
  finance: {
    viewFinanceEmployees: "UMS_FINANCE_EMPLOYEES_VIEW",
    createFinanceEmployees: "UMS_FINANCE_EMPLOYEES_CREATE",
    editFinanceEmployees: "UMS_FINANCE_EMPLOYEES_EDIT",
  },
  batch: {
    viewReports: "UMS_BATCH_REPORTS_VIEW",
    createReport: "UMS_BATCH_REPORTS_CREATE",
    editReport: "UMS_BATCH_REPORTS_EDIT",
    deleteReport: "UMS_BATCH_REPORTS_DELETE",
    scheduleReport: "UMS_BATCH_REPORTS_SCHEDULE",

    viewUploads: "UMS_BATCH_UPLOADS_VIEW",
    createUpload: "UMS_BATCH_UPLOADS_CREATE",
    editUpload: "UMS_BATCH_UPLOADS_EDIT",
    deleteUpload: "UMS_BATCH_UPLOADS_DELETE",
    scheduleUpload: "UMS_BATCH_UPLOADS_SCHEDULE",

    viewJobs: "UMS_BATCH_JOBS_VIEW",
    submitJob: "UMS_BATCH_JOBS_SUBMIT",
  },
  user: {
    impersonate: "UMS_USERS_IMPERSONATE_VIEW",

    viewUserProfile: "UMS_USERS_PROFILE_VIEW",
    createUserProfile: "UMS_USERS_PROFILE_CREATE",
    editUserProfile: "UMS_USERS_PROFILE_EDIT",
    createUserByAdmin: "UMS_USERS_PROFILE_ADMIN_CREATE",
    editUserPermission: "UMS_USERS_PROFILE_PERMISSION_EDIT",
    deleteUserProfile: "UMS_USERS_PROFILE_DELETE",
  },
  hierarchy: {
    viewDepartment: "UMS_SETTINGS_HIERARCHY_DEPARTMENT_VIEW",
    createDepartment: "UMS_SETTINGS_HIERARCHY_DEPARTMENT_CREATE",
    editDepartment: "UMS_SETTINGS_HIERARCHY_DEPARTMENT_EDIT",

    viewSubDepartment: "UMS_SETTINGS_HIERARCHY_SUBDEPARTMENT_VIEW",
    createSubDepartment: "UMS_SETTINGS_HIERARCHY_SUBDEPARTMENT_CREATE",
    editSubDepartment: "UMS_SETTINGS_HIERARCHY_SUBDEPARTMENT_EDIT",

    viewUnit: "UMS_SETTINGS_HIERARCHY_UNIT_VIEW",
    createUnit: "UMS_SETTINGS_HIERARCHY_UNIT_CREATE",
    editUnit: "UMS_SETTINGS_HIERARCHY_UNIT_EDIT",
    deleteUnit: "UMS_SETTINGS_HIERARCHY_UNIT_DELETE",

    viewVertical: "UMS_SETTINGS_HIERARCHY_VERTICAL_VIEW",
    createVertical: "UMS_SETTINGS_HIERARCHY_VERTICAL_CREATE",
    editVertical: "UMS_SETTINGS_HIERARCHY_VERTICAL_EDIT",
    deleteVertical: "UMS_SETTINGS_HIERARCHY_VERTICAL_DELETE",

    viewCampaign: "UMS_SETTINGS_HIERARCHY_CAMPAIGN_VIEW",
    createCampaign: "UMS_SETTINGS_HIERARCHY_CAMPAIGN_CREATE",
    editCampaign: "UMS_SETTINGS_HIERARCHY_CAMPAIGN_EDIT",
    deleteCampaign: "UMS_SETTINGS_HIERARCHY_CAMPAIGN_DELETE",

    viewCity: "UMS_SETTINGS_HIERARCHY_CITY_VIEW",
    createCity: "UMS_SETTINGS_HIERARCHY_CITY_CREATE",
    editCity: "UMS_SETTINGS_HIERARCHY_CITY_EDIT",
    deleteCity: "UMS_SETTINGS_HIERARCHY_CITY_DELETE",

    viewCountry: "UMS_SETTINGS_HIERARCHY_COUNTRY_VIEW",
    createCountry: "UMS_SETTINGS_HIERARCHY_COUNTRY_CREATE",
    editCountry: "UMS_SETTINGS_HIERARCHY_COUNTRY_EDIT",
    deleteCountry: "UMS_SETTINGS_HIERARCHY_COUNTRY_DELETE",

    viewRole: "UMS_SETTINGS_HIERARCHY_ROLE_VIEW",
    createRole: "UMS_SETTINGS_HIERARCHY_ROLE_CREATE",
    editRole: "UMS_SETTINGS_HIERARCHY_ROLE_EDIT",
    deleteRole: "UMS_SETTINGS_HIERARCHY_ROLE_DELETE",

    viewTeam: "UMS_SETTINGS_HIERARCHY_TEAM_VIEW",

    viewLanguage: "UMS_SETTINGS_HIERARCHY_LANGUAGE_VIEW",
    createLanguage: "UMS_SETTINGS_HIERARCHY_LANGUAGE_CREATE",
    editLanguage: "UMS_SETTINGS_HIERARCHY_LANGUAGE_EDIT",
    deleteLanguage: "UMS_SETTINGS_HIERARCHY_LANGUAGE_DELETE",
  },
  setup: {
    viewOrganization: "UMS_SETTINGS_ORGANIZATION_VIEW",
    createOrganization: "UMS_SETTINGS_ORGANIZATION_CREATE",
    editOrganization: "UMS_SETTINGS_ORGANIZATION_EDIT",
    deleteOrganization: "UMS_SETTINGS_ORGANIZATION_DELETE",
  },
  permissionTemplate: {
    viewPermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_VIEW",
    createPermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_CREATE",
    editPermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_EDIT",
    clonePermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_CLONE",
    deletePermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_DELETE",
    showUsersPermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_SHOW_USERS",
  },
  permissionModule: {
    viewPermissionModule: "UMS_SETTINGS_APPLICATION_SCREEN_VIEW",
    createPermissionModule: "UMS_SETTINGS_APPLICATION_SCREEN_CREATE",
    editPermissionModule: "UMS_SETTINGS_APPLICATION_SCREEN_EDIT",
    deletePermissionModule: "UMS_SETTINGS_APPLICATION_SCREEN_DELETE",
  },
  configurePermission: {
    viewAllApplication: "UMS_CONFIGURE_PERMISSION_ALL_VIEW",
    viewCommonApplication: "UMS_CONFIGURE_PERMISSION_COMMON_VIEW",
    viewOmsApplication: "UMS_CONFIGURE_PERMISSION_OMS_VIEW",
    viewUmsApplication: "UMS_CONFIGURE_PERMISSION_UMS_VIEW",
    viewLmsApplication: "UMS_CONFIGURE_PERMISSION_LMS_VIEW",
    viewImsApplication: "UMS_CONFIGURE_PERMISSION_IMS_VIEW",
    viewMiddleWareApplication: "UMS_CONFIGURE_PERMISSION_MIDDLEWARE_VIEW",
    viewAchieveApplication: "UMS_CONFIGURE_PERMISSION_ACHIEVE_VIEW",
    viewPaymentApplication: "UMS_CONFIGURE_PERMISSION_PAYMENT_VIEW",
    viewMentoringApplication: "UMS_CONFIGURE_PERMISSION_MENTORING_VIEW",
    viewPomsApplication: "UMS_CONFIGURE_PERMISSION_POMS_VIEW",
    viewFmsApplication: "UMS_CONFIGURE_PERMISSION_FMS_VIEW",
    viewWmsApplication: "UMS_CONFIGURE_PERMISSION_WMS_VIEW",
    viewCxmsApplication: "UMS_CONFIGURE_PERMISSION_CXMS_VIEW",
    viewScAchieveApplication: "UMS_CONFIGURE_PERMISSION_SCACHIEVE_VIEW",
    viewScosApplication: "UMS_CONFIGURE_PERMISSION_SCOS_VIEW",
    viewSosApplication: "UMS_CONFIGURE_PERMISSION_SOS_VIEW",
    viewCounsellingApplication: "UMS_CONFIGURE_PERMISSION_COUNSELLING_VIEW",
    viewUxAchieveApplication: "UMS_CONFIGURE_PERMISSION_UXACHIEVE_VIEW",
    viewDfosApplication: "UMS_CONFIGURE_PERMISSION_DFOS_VIEW",
    viewDfAchieveApplication: "UMS_CONFIGURE_DFACHIEVE_VIEW",
    viewStmsApplication: "UMS_CONFIGURE_STMS_VIEW",
    viewComplianceApplication: "UMS_CONFIGURE_COMPLIANCE_VIEW",
    viewCnsApplication: "UMS_CONFIGURE_PERMISSION_CNS_VIEW",
  },
  group: {
    viewGroup: "UMS_SETTINGS_GROUP_VIEW",
    createGroup: "UMS_SETTINGS_GROUP_CREATE",
    editGroup: "UMS_SETTINGS_GROUP_EDIT",
    deleteGroup: "UMS_SETTINGS_GROUP_DELETE",
  },
  assignmentRule: {
    viewAssignmentRule: "UMS_SETTINGS_ASSIGNMENT_RULE_VIEW",
    createAssignmentRule: "UMS_SETTINGS_ASSIGNMENT_RULE_CREATE",
    editAssignmentRule: "UMS_SETTINGS_ASSIGNMENT_RULE_EDIT",
    deleteAssignmentRule: "UMS_SETTINGS_ASSIGNMENT_RULE_DELETE",
  },
  appToken: {
    viewAppToken: "UMS_SETTINGS_APP_TOKEN_VIEW",
    createAppToken: "UMS_SETTINGS_APP_TOKEN_CREATE",
    editAppToken: "UMS_SETTINGS_APP_TOKEN_EDIT",
    deleteAppToken: "UMS_SETTINGS_APP_TOKEN_DELETE",
  },
  settings: {
    viewAppRole: "UMS_SETTINGS_APP_ROLE_VIEW",
    createAppRole: "UMS_SETTINGS_APP_ROLE_CREATE",
    editAppRole: "UMS_SETTINGS_APP_ROLE_EDIT",
    editAppRoleName: "UMS_SETTINGS_APP_ROLE_NAME_EDIT",
    cloneAppRole: "UMS_SETTINGS_APP_ROLE_CLONE",
    viewAppRolePermissions: "UMS_SETTINGS_APP_ROLE_PERMISSIONS_VIEW",
    deleteAppRole: "UMS_SETTINGS_APP_ROLE_DELETE",

    viewAppUser: "UMS_SETTINGS_APP_USER_VIEW",
    createAppUser: "UMS_SETTINGS_APP_USER_CREATE",
    editAppUser: "UMS_SETTINGS_APP_USER_EDIT",
    deleteAppUser: "UMS_SETTINGS_APP_USER_DELETE",

    viewAppGroup: "UMS_SETTINGS_APP_GROUP_VIEW",
    createAppGroup: "UMS_SETTINGS_APP_GROUP_CREATE",
    editAppGroup: "UMS_SETTINGS_APP_GROUP_EDIT",
    editAppGroupUsers: "UMS_SETTINGS_APP_GROUP_USERS_EDIT",
    deleteAppGroup: "UMS_SETTINGS_APP_GROUP_DELETE",
  },

  communication: {
    viewSmsTemplates: "UMS_SETTINGS_SMS_TEMPLATES_VIEW",
    createSmsTemplates: "UMS_SETTINGS_SMS_TEMPLATES_CREATE",
    editSmsTemplates: "UMS_SETTINGS_SMS_TEMPLATES_EDIT",
    deleteSmsTemplates: "UMS_SETTINGS_SMS_TEMPLATES_DELETE",

    viewPlaceholder: "UMS_SETTINGS_PLACEHOLDER_VIEW",
    createPlaceholder: "UMS_SETTINGS_PLACEHOLDER_CREATE",
    editPlaceholder: "UMS_SETTINGS_PLACEHOLDER_EDIT",
    deletePlaceholder: "UMS_SETTINGS_PLACEHOLDER_DELETE",

    viewSmsTransaction: "UMS_SETTINGS_SMS_TEMPLATES_VIEW",

    viewSmsProvider: "UMS_SETTINGS_SMS_PROVIDER_VIEW",
    createSmsProvider: "UMS_SETTINGS_SMS_PROVIDER_CREATE",
    editSmsProvider: "UMS_SETTINGS_SMS_PROVIDER_EDIT",
    deleteSmsProvider: "UMS_SETTINGS_SMS_PROVIDER_DELETE",
  },

  maintenance: {
    viewCacheConfig: "UMS_SETTINGS_CACHE_CONFIG_VIEW",
    viewAppConfig: "UMS_SETTINGS_APP_CONFIG_VIEW",

    viewGridConfig: "UMS_SETTINGS_GRID_CONFIG_VIEW",
    createGridConfig: "UMS_SETTINGS_GRID_CONFIG_CREATE",
    editGridConfig: "UMS_SETTINGS_GRID_CONFIG_EDIT",
    deleteGridConfig: "UMS_SETTINGS_GRID_CONFIG_DELETE",
  },

  secret: {
    viewSecret: "UMS_SECRET_ADD_SECRET_VIEW",
    editSecret: "UMS_SECRET_ADD_SECRET_EDIT",
    createSecret: "UMS_SECRET_ADD_SECRET_CREATE",
    deleteSecret: "UMS_SECRET_ADD_SECRET_DELETE",
  },

  vault: {
    viewVault: "UMS_VAULT_VAULT_MANAGEMENT_VIEW",
    editVault: "UMS_VAULT_VAULT_MANAGEMENT_EDIT",
    createVault: "UMS_VAULT_VAULT_MANAGEMENT_CREATE",
    deleteVault: "UMS_VAULT_VAULT_MANAGEMENT_DELETE",
  },
  vaultRole: {
    createVaultRole: "UMS_VAULT_ROLE_VAULT_ROLE_CREATE",
    editVaultRole: "UMS_VAULT_ROLE_VAULT_ROLE_EDIT",
    deleteVaultRole: "UMS_VAULT_ROLE_VAULT_ROLE_DELETE",
    viewVaultRole: "UMS_VAULT_ROLE_VAULT_ROLE_VIEW",
  },

  security: {
    viewReport: "UMS_ANALYTICS_SECURITY_REPORT_VIEW",
    editReport: "UMS_ANALYTICS_SECURITY_REPORT_EDIT",
    createReport: "UMS_ANALYTICS_SECURITY_REPORT_CREATE",
    deleteReport: "UMS_ANALYTICS_SECURITY_REPORT_DELETE",
  },

  npgexemplumMigration: {
    viewNpgexemplumMigration: "UMS_NPGEXEMPLUM_NPGEXEMPLUM_MIGRATION_VIEW",
    editNpgexemplumMigration: "UMS_NPGEXEMPLUM_NPGEXEMPLUM_MIGRATION_EDIT",
    createNpgexemplumMigration: "UMS_NPGEXEMPLUM_NPGEXEMPLUM_MIGRATION_CREATE",
    deleteNpgexemplumMigration: "UMS_NPGEXEMPLUM_NPGEXEMPLUM_MIGRATION_DELETE",
  },

  dataSeeding: {
    viewDataSeeding: "UMS_DATA_SEEDING_DATA_SEEDING_VIEW",
    editDataSeeding: "UMS_DATA_SEEDING_DATA_SEEDING_EDIT",
    createDataSeeding: "UMS_DATA_SEEDING_DATA_SEEDING_CREATE",
    deleteDataSeeding: "UMS_DATA_SEEDING_DATA_SEEDING_DELETE",
  },
  /** Function to validate permission */
  validatePermission: (user, permission) => {
    if (user && permission) {
      const userPermissions = get(user, "permissions", []);
      if (isArray(permission)) {
        return intersection(userPermissions, permission).length > 0;
      }

      return !!userPermissions.includes(permission);
    }
    return false;
  },
};
