const { get, isArray, intersection } = require('lodash');

module.exports = {
    user: {
        viewUserDashboard: "UMS_USERS_PROFILE_VIEW",
        editUserDashboard: "UMS_USERS_PROFILE_EDIT",
        deleteUserDashboard: "UMS_USERS_PROFILE_DELETE",
        impersonate: "UMS_USERS_IMPERSONATE_VIEW"
    },
    hierarchy: {
        viewSales: "UMS_BUSINESS_DEVELOPMENT_EMPLOYEES_VIEW",
        viewUserExperience: "UMS_USER_EXPERIENCE_EMPLOYEES_VIEW",
        viewSupplyChain: "UMS_SUPPLY_CHAIN_EMPLOYEES_VIEW",
        viewFinance: "UMS_FINANCE_EMPLOYEES_VIEW",
        viewAll: "UMS_USERS_PROFILE_VIEW"
    },
    role: {
        createRole: "UMS_SETTINGS_HIERARCHY_ROLE_CREATE",
        editRole: "UMS_SETTINGS_HIERARCHY_ROLE_EDIT",
        deleteRole: "UMS_SETTINGS_HIERARCHY_ROLE_DELETE"
    },
    group: {
        viewGroupDashboard: "UMS_SETTINGS_GROUP_VIEW",
        editGroupDashboard: "UMS_SETTINGS_GROUP_EDIT",
        deleteGroupDashboard: "UMS_SETTINGS_GROUP_DELETE"
    },
    permission: {
        viewPermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_VIEW",
        editPermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_EDIT",
        deletePermissionTemplate: "UMS_SETTINGS_PERMISSION_TEMPLATE_DELETE",
        createScreenPermission: "UMS_SETTINGS_APPLICATION_SCREEN_VIEW"
    },
    appRole: {
        viewAppRole: "UMS_SETTINGS_APP_ROLE_VIEW",
        createAppRole: "UMS_SETTINGS_APP_ROLE_CREATE",
        editAppRole: "UMS_SETTINGS_APP_ROLE_EDIT",
        editAppRoleName: "UMS_SETTINGS_APP_ROLE_NAME_EDIT",
        cloneAppRole: "UMS_SETTINGS_APP_ROLE_CLONE",
        viewAppRolePermissions: "UMS_SETTINGS_APP_ROLE_PERMISSIONS_VIEW",
        deleteAppRole: "UMS_SETTINGS_APP_ROLE_DELETE"
    },
    appUser: {
        viewAppUser: "UMS_SETTINGS_APP_USER_VIEW",
        createAppUser: "UMS_SETTINGS_APP_USER_CREATE",
        editAppUser: "UMS_SETTINGS_APP_USER_EDIT",
        deleteAppUser: "UMS_SETTINGS_APP_USER_DELETE"
    },
    support: {
        viewSupportDashboard: "SUPPORT_DASHBOARD_VIEW"
    },
    maintenance: {
        viewMaintenanceDashboard: "MAINTENANCE_DASHBOARD_VIEW"
    },
    order: {
        viewSalesOrder: "ORDER_SALESORDER_VIEW_LIST",
        viewSalesOrderDetails: "ORDER_SALESORDER_VIEW_DETAILS",
        viewCashbackDetails: "ORDER_CASHBACK_VIEW",
        viewInventory: "ORDER_INVENTORY_VIEW",
        viewPremiumIdDetails: "ORDER_PREMIUM_ID_VIEW"
    },
    inventory: {
        canEdit: "ACHIEVE_INVENTORY_DASHBOARD_EDIT"
    },
    postOrder: {
        viewAnnalytics: "ORDER_POST_ORDER_ANALYTICS_VIEW"
    },
    product: {
        viewProductDashboard: "PRODUCT_DETAILS_VIEW"
    },
    payment: {
        viewPaymentReference: "PAYMENT_PAYMENT_REFERENCES_VIEW",
        viewCapitalFloat: "PAYMENT_CF_VIEW"
    },

    /**Online Payment */
    gatewayPayment: {
        viewBajaj: "PAYMENT_BAJAJ_VIEW",
        viewPaytm: "PAYMENT_PAYTM_VIEW",
        viewPayu: "PAYMENT_PAYU_VIEW",
        viewPinelabs: "PAYMENT_PINELABS_VIEW"
    },
    /**Online Payment */

    /**Offline Payment */
    nonGatewayPayment: {
        viewCheque: "PAYMENT_CHEQUE_VIEW",
        viewNeft: "PAYMENT_NEFT_VIEW",
        viewImps: "PAYMENT_IMPS_VIEW",
        viewChallan: "PAYMENT_CHALLAN_VIEW",
        viewIcr: "PAYMENT_ICR_VIEW",
        editIcr: "PAYMENT_ICR_EDIT",
        deleteIcr: "PAYMENT_ICR_DELETE",
        editReconciliation: "PAYMENT_ICR_EDIT_RECONCILIATION",
        editComment: "PAYMENT_ICR_EDIT_COMMENT"
    },
    /**Offline Payment */

    /**Loans */
    loanZest: {
        viewLoanDashboard: "PAYMENT_ZEST_VIEW",
        viewNachDashboard: "PAYMENT_ZEST_VIEW",
        viewAllLoans: "PAYMENT_ZEST_VIEW_ALL"
    },
    loanPaysense: {
        viewLoanDashboard: "PAYMENT_PAYSENSE_VIEW",
        viewNachDashboard: "PAYMENT_PAYSENSE_VIEW",
        viewCollectionDashboard: "PAYMENT_PAYSENSE_VIEW",
        createLoan: "PAYMENT_PAYSENSE_VIEW",
        cancelLoan: "PAYMENT_PAYSENSE_VIEW",
        manualPayment: "PAYMENT_PAYSENSE_VIEW",
        viewAllLoans: "PAYMENT_PAYSENSE_VIEW_ALL"
    },
    loanAvanse: {
        viewLoanDashboard: "PAYMENT_AVANSE_VIEW_LOAN",
        viewNachDashboard: "PAYMENT_AVANSE_NACH_DASHBOARD_VIEW",
        viewCollectionDashboard: "PAYMENT_AVANSE_COLLECTION_DASHBOARD_VIEW",
        createLoan: "PAYMENT_AVANSE_CREATE_LOAN",
        cancelLoan: "PAYMENT_AVANSE_CANCEL_LOAN",
        manualPayment: "PAYMENT_AVANSE_MANUAL_PAYMENT",
        viewAllLoans: "PAYMENT_AVANSE_VIEW_ALL"
    },
    loanIIFL: {
        viewLoanDashboard: "PAYMENT_IIFL_VIEW_LOAN",
        viewNachDashboard: "PAYMENT_IIFL_NACH_DASHBOARD_VIEW",
        viewCollectionDashboard: "PAYMENT_IIFL_COLLECTION_DASHBOARD_VIEW",
        createLoan: "PAYMENT_IIFL_CREATE_LOAN",
        cancelLoan: "PAYMENT_IIFL_CANCEL_LOAN",
        manualPayment: "PAYMENT_IIFL_MANUAL_PAYMENT",
        deleteLoan: "PAYMENT_IIFL_DELETE_LOAN",
        viewAllLoans: "PAYMENT_IIFL_VIEW_ALL"
    },
    loanByjusDirect: {
        viewLoanDashboard: "PAYMENT_BYJUS_DIRECT_VIEW_LOAN",
        viewAssureDashboard: "PAYMENT_BYJUS_ASSURE_VIEW_LOAN",
        viewNachDashboard: "PAYMENT_BYJUS_DIRECT_NACH_DASHBOARD_VIEW",
        viewCollectionDashboard: "PAYMENT_BYJUS_DIRECT_COLLECTION_DASHBOARD_VIEW",
        createLoan: "PAYMENT_BYJUS_DIRECT_CREATE_LOAN",
        manualPayment: "PAYMENT_BYJUS_DIRECT_MANUAL_PAYMENT",
        modifyCriticalField: "PAYMENT_BYJUS_DIRECT_MODIFY_CRITICAL_FIELDS",
        deleteLoan: "PAYMENT_BYJUS_DIRECT_DELETE_LOAN",
        deleteProcessedLoan: "PAYMENT_BYJUS_DIRECT_PROCESSED_LOAN_DELETION",
        forecloseLoan: "PAYMENT_BYJUS_DIRECT_FORECLOSE_LOAN",
        viewAllLoans: "PAYMENT_BYJUS_DIRECT_VIEW_ALL",
        markMatureLoan: "PAYMENT_BYJUS_DIRECT_MARK_MATURED_LOAN"

    },
    loanKotak: {
        viewLoanDashboard: "PAYMENT_KOTAK_VIEW_LOAN",
        viewNachDashboard: "PAYMENT_KOTAK_NACH_DASHBOARD_VIEW",
        viewCollectionDashboard: "PAYMENT_KOTAK_COLLECTION_DASHBOARD_VIEW",
        createLoan: "PAYMENT_KOTAK_CREATE_LOAN",
        cancelLoan: "PAYMENT_KOTAK_CANCEL_LOAN",
        manualPayment: "PAYMENT_KOTAK_MANUAL_PAYMENT",
        viewAllLoans: "PAYMENT_KOTAK_VIEW_ALL"
    },
    loanRBL: {
        viewLoanDashboard: "PAYMENT_RBL_VIEW_LOAN",
        viewNachDashboard: "PAYMENT_RBL_NACH_DASHBOARD_VIEW",
        viewCollectionDashboard: "PAYMENT_RBL_COLLECTION_DASHBOARD_VIEW",
        createLoan: "PAYMENT_RBL_CREATE_LOAN",
        cancelLoan: "PAYMENT_RBL_CANCEL_LOAN",
        manualPayment: "PAYMENT_RBL_MANUAL_PAYMENT",
        viewAllLoans: "PAYMENT_RBL_VIEW_ALL",
        deleteProcessedLoan: "PAYMENT_RBL_PROCESSED_LOAN_DELETION",
        paymentSettlement: "PAYMENT_RBL_SETTLEMENT"
    },
    loanICICI: {
        viewLoanDashboard: "PAYMENT_ICICI_DASHBOARD_VIEW",
        viewNachDashboard: "PAYMENT_ICICI_NACH_DASHBOARD_VIEW",
        viewCollectionDashboard: "PAYMENT_ICICI_COLLECTION_DASHBOARD_VIEW",
        createLoan: "PAYMENT_ICICI_CREATE_LOAN",
        cancelLoan: "PAYMENT_ICICI_CANCEL_LOAN",
        manualPayment: "PAYMENT_ICICI_MANUAL_PAYMENT",
        modifyCriticalField: "PAYMENT_ICICI_MODIFY_CRITICAL_FIELDS",
        viewAllLoans: "PAYMENT_ICICI_VIEW_ALL",
        deleteProcessedLoan: "PAYMENT_ICICI_PROCESSED_LOAN_DELETION"
    },
    loanFullerton: {
        viewLoanDashboard: "PAYMENT_FULLERTON_VIEW_LOAN",
        viewNachDashboard: "PAYMENT_FULLERTON_NACH_DASHBOARD_VIEW",
        viewCollectionDashboard: "PAYMENT_FULLERTON_COLLECTION_DASHBOARD_VIEW",
        createLoan: "PAYMENT_FULLERTON_CREATE_LOAN",
        viewAllLoans: "PAYMENT_FULLERTON_VIEW_ALL",
        cancelLoan: "PAYMENT_FULLERTON_CANCEL_LOAN",
        manualPayment: "PAYMENT_FULLERTON_MANUAL_PAYMENT",
        paymentSettlement: "PAYMENT_FULLERTON_SETTLEMENT"
    },
    loanFullertonV2: {
        viewV2LoanDashboard: "PAYMENT_FULLERTONV2_VIEW_LOAN",
        viewAllLoans: "PAYMENT_FULLERTON_VIEW_ALL",
        createLoan: "PAYMENT_FULLERTONV2_CREATE_LOAN",
        uploadDocs: "PAYMENT_FULLERTONV2_UPLOAD_DOC",
        reOTPSend: "PAYMENT_FULLERTONV2_SEND_REOTP",
        reOpen: "PAYMENT_FULLERTONV2_REOPEN",
        cancelLoan: "PAYMENT_FULLERTONV2_CANCEL_LOAN",
        manualPayment: "PAYMENT_FULLERTONV2_MANUAL_PAYMENT",
        deleteLoan: "PAYMENT_FULLERTONV2_DELETE_LOAN"
    },
    manualPayment: {
        specialPrivilege: "PAYMENT_MANUAL_PAYMENT_SPECIAL_PRIVILEGE"
    },
    /**Loans */

    /**NACH Dashboard */
    nach: {
        updateNachDetails: "PAYMENT_NACH_DASHBOARD_UPDATE",
        viewNachHistory: "PAYMENT_NACH_DASHBOARD_HISTORY"
    },
    /** */

    /**Batch */
    batch: {
        viewReports: "BATCH_REPORTS_VIEW",
        createReport: "BATCH_REPORTS_CREATE",
        editReport: "BATCH_REPORTS_EDIT",
        deleteReport: "BATCH_REPORTS_DELETE",
        viewJobs: "BATCH_JOBS_VIEW",
        uploadJobs: "BATCH_UPLOAD_JOBS"
    },
    umsBatch: {
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
        submitJob: "UMS_BATCH_JOBS_SUBMIT"
    },
    imsBatch: {
        viewJobs: "IMS_BATCH_JOBS_VIEW",
        viewReports: "IMS_BATCH_REPORT_VIEW",
        uploadJobs: "IMS_BATCH_UPLOAD_VIEW",
        submitJob: "IMS_BATCH_JOBS_SUBMIT_JOB",
    },
    fmsBatch: {
        viewJobs: "FMS_BATCH_JOB_INSTANCES_VIEW",
        viewReports: "FMS_BATCH_REPORT_TEMPLATES_VIEW",
        uploadJobs: "FMS_BATCH_UPLOAD_TEMPLATES_VIEW",
        submitJob: "FMS_BATCH_JOB_SUBMIT",
    },
    sosBatch: {
        viewReports: "SOS_BATCH_REPORT_TEMPLATES_VIEW",
        viewUpload: "SOS_BATCH_UPLOAD_TEMPLATES_VIEW",
        createReport: "SOS_BATCH_REPORT_CREATE",
        editReport: "SOS_BATCH_REPORT_EDIT",
        deleteReport: "SOS_BATCH_REPORT_DELETE",
        jobView: "SOS_BATCH_JOBS_VIEW",
        createJob: "SOS_BATCH_JOBS_CREATE",
        submitJob: "SOS_BATCH_JOBS_SUBMIT",
        uploadJobs: "SOS_BATCH_UPLOAD_JOBS",
        submitJob: "SOS_BATCH_JOB_SUBMIT",
        viewJobInstances: "SOS_JOB_INSTANCES_VIEW"
    },
    omsBatch: {
        viewReports: "OMS_BATCH_REPORT_VIEW",
        createReport: "OMS_BATCH_REPORT_CREATE",
        editReport: "OMS_BATCH_REPORTS_EDIT",
        deleteReport: "OMS_BATCH_REPORTS_DELETE",
        viewJobs: "OMS_BATCH_JOBS_VIEW",
        submitJob: "OMS_BATCH_JOBS_SUBMIT_JOB",
        uploadJobs: "OMS_BATCH_UPLOAD_VIEW",
        createUploads: "OMS_BATCH_UPLOAD_CREATE"
    },
    cxmsBatch: {
        viewReports: "CXMS_BATCH_REPORT_VIEW",
        createReport: "CXMS_BATCH_REPORT_CREATE",
        editReport: "CXMS_BATCH_REPORTS_EDIT",
        deleteReport: "CXMS_BATCH_REPORTS_DELETE",
        viewJobs: "CXMS_BATCH_JOBS_VIEW",
        submitJob: "CXMS_BATCH_JOBS_SUBMIT_JOB",
        uploadJobs: "CXMS_BATCH_UPLOAD_VIEW",
        createUploads: "CXMS_BATCH_UPLOAD_CREATE"
    },
    lmsBatch: {
        viewJobs: "LMS_BATCH_JOBS_VIEW",
        viewReports: "LMS_BATCH_REPORTS_VIEW",
        uploadJobs: "LMS_BATCH_UPLOAD_JOBS",
        submitJob: "LMS_BATCH_JOBS_SUBMIT_JOB"
    },
    pomsBatch: {
        viewReports: "POMS_BATCH_REPORTS_VIEW",
        createReport: "POMS_BATCH_REPORTS_CREATE",
        editReport: "POMS_BATCH_REPORTS_EDIT",
        deleteReport: "POMS_BATCH_REPORTS_DELETE",
        viewJobs: "POMS_BATCH_JOBS_VIEW",
        uploadJobs: "POMS_BATCH_UPLOAD_JOBS",
        submitJob: "POMS_BATCH_JOBS_SUBMIT_JOB",
        viewEmailUploads: "POMS_BATCH_EMAIL_UPLOAD_JOBS",
        viewJobSummary: "POMS_BATCH_JOB_SUMMARY_VIEW",
    },
    dfosBatch:{
        viewReports: "DFOS_BATCH_REPORT_VIEW",
        createReport: "DFOS_BATCH_REPORT_CREATE",
        editReport: "DFOS_BATCH_REPORT_EDIT",
        deleteReport: "DFOS_BATCH_REPORT_DELETE",
    
        submitJob: "DFOS_BATCH_UPLOAD_SUBMIT",
        uploadJobs: "DFOS_BATCH_UPLOAD_VIEW",
        createUpload: "DFOS_BATCH_UPLOAD_CREATE",
    
        viewJobs: "DFOS_BATCH_JOBS_VIEW"
    },
    mosBatch: {
        viewReports: "MOS_BATCH_REPORTS_VIEW",
        createReport: "MOS_BATCH_REPORTS_CREATE",
        editReport: "MOS_BATCH_REPORTS_EDIT",
        deleteReport: "MOS_BATCH_REPORTS_DELETE",
        viewJobs: "MOS_BATCH_JOBS_VIEW",
        submitJob: "MOS_BATCH_JOBS_SUBMIT_JOB",
        uploadJobs: "MOS_BATCH_UPLOAD_VIEW",
        createUploads: "MOS_BATCH_UPLOAD_CREATE"
    },

    sales: {
        attendanceCard: "USERS_SALES_VIEW_ATTENDANCE",
        sapAttendanceCard: "USERS_SALES_VIEW_SAP_ATTENDANCE",
        attendanceSummaryCard: "USERS_SALES_VIEW_ATTENDANCE_SUMMARY",
        sapAttendanceSummaryCard: "USERS_SALES_VIEW_SAP_ATTENDANCE_SUMMARY",
        salesDashboardCard: "USERS_SALES_VIEW_DASHBOARD",
        salesDiscrepancyCard: "USERS_SALES_VIEW_DISCREPANCY",
        salesSummaryCard: "USERS_SALES_VIEW_SUMMARY",
        salesOHCard: "USERS_SALES_VIEW_OH",
        salesPICCard: "USERS_SALES_VIEW_PIC",
        salesSnapshotCard: "UMS_SALES_MANAGE_SNAPSHOT_DASHBOARD",
        editSalesSnapshotCard: "UMS_SALES_MANAGE_SNAPSHOT_EDIT",
        salesSnapshotSummaryCard: "UMS_SALES_MANAGE_SNAPSHOT_SUMMARY",
        salesWFHDashboardCard: "USERS_SALES_VIEW_WFH_DASHBOARD",
        salesWFHAttendanceCard: "USERS_SALES_VIEW_WFH_ATTENDANCE",
        salesWFHWorkflowCard: "USERS_SALES_VIEW_WFH_WORKFLOW",
        salesWFHSummaryCard: "USERS_SALES_VIEW_WFH_SUMMARY",
        salesWFHSeedAttendanceViewCard: "UMS_SALES_ADMIN_SEED_ATTENDANCE_SCREEN_VIEW",
        salesWebTalktimeCard: "USERS_SALES_VIEW_WEB_TALKTIME",
        salesIVRTalktimeCard: "USERS_SALES_VIEW_IVR_TALKTIME",
        salesCombinedTalktimeCard: "USERS_SALES_VIEW_COMBINED_TALKTIME",
        salesTalktimeSummaryCard: "USERS_SALES_VIEW_TALKTIME_SUMMARY",
        salesCohortSummaryCard: "USERS_SALES_VIEW_COHORT_SUMMARY",
        attritionCard: "USERS_SALES_VIEW_ATTRITION",
        rippleHireCard: "USERS_SALES_VIEW_RIPPLEHIRE",
        salesViewHiringCampaign: "USERS_SALES_HIRING_CAMPAIGN_VIEW",
        salesUpdateEmailPermission: "USERS_SALES_EMAIL_UPDATE",
        sopTrackerCard: "USERS_SALES_VIEW_SOP_TRACKER",
        customerDemoSessionCard: "USERS_SALES_VIEW_CUSTOMER_DEMO_SESSION"
    },

    /**Function to validate permission */
    validatePermission: (user, permission) => {
        if (user && permission) {
            const userPermissions = get(user, 'permissions', []);
            if (isArray(permission)) {
                return intersection(userPermissions, permission).length > 0
            }
            else {
                return (userPermissions.includes(permission)) ? true : false;
            }
        }
        return false;
    }
}
