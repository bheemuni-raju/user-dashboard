'use strict';

const express = require('express');

const userRoutes = require('./core/user/userRoutes');
const masterUserRoutes = require('./core/masteruser/masterUserRoutes');
const commonUserRoutes = require('./core/common/userRoutes');
const thirdpartyRoutes = require('./core/thirdparty/thirdpartyRoutes');
const authRoutes = require('./core/auth/authRoutes');
const mfaRoutes = require('./core/mfa/mfaRoutes');
const developerTokenRoutes = require('./core/developertoken/developerTokenRoutes');

const cityRoutes = require('./settings/city/cityRoutes');
const countryRoutes = require('./settings/country/countryRoutes');
const organizationRoutes = require('./settings/organization/organizationRoutes');
const groupRoutes = require('./settings/group/groupRoutes');
const apptokenRoutes = require('./settings/apptoken/appTokenRoutes');
const appRoleRoutes = require('./settings/approle/appRoleRoutes');
const appUserRoutes = require('./settings/appuser/appUserRoutes');
const appGroupRoutes = require('./settings/appgroup/appGroupRoutes');
const allUserRoutes = require('./settings/analytics/analyticsRoutes');
const languageRoutes = require('./settings/language/languageRoutes');
const smsTemplateRoutes = require('./settings/communication/smstemplates/smsTemplateRoutes');
const placeholderRoutes = require('./settings/communication/placeholder/placeholderRoutes');
const smsTransactionsRoutes = require('./settings/communication/smstransactions/smsTransactionsRoutes');
const smsProviderRoutes = require('./settings/communication/smsprovider/smsProviderRoutes');

const permissionRoutes = require('./settings/permission/routes');
const permissionRoutesV1 = require('./settings/permission-beta/permissionRoutes');

const hierarchyRoutes = require('./settings/hierarchy/routes');
const hierarchyBetaRoutes = require('./settings/hierarchy-beta/routes');
const assignmentRuleRoutes = require('./settings/assignmentrule/assignmentRuleRoutes');

const configurationBetaRoutes = require('./settings/configuration-beta/routes');
const enumRoutes = require('./settings/enum/enumRoutes');
const appGroupBetaRoutes = require('./settings/appgroupBeta/appGroupBetaRoutes');

const ueUserRoutes = require('./userexperience/user/ueUserRoutes');
const scUserRoutes = require('./supplychain/user/scUserRoutes');
const financeUserRoutes = require('./finance/user/financeUserRoutes');

const wfhAttendanceRoutes = require('./businessdevelopment/wfhattendance/wfhAttendanceRoutes');
const wfhAttendanceWorkflowRoutes = require('./businessdevelopment/wfhattendance/wfhAttendanceWorkflowRoutes');
const wfhTalkTimeRoutes = require('./businessdevelopment/wfhtalktime/wfhTalkTimeRoutes');
const customerDemoSessionsRoutes = require('./businessdevelopment/customerdemosessions/customerDemoSessionsRoutes');

const picRoutes = require('./businessdevelopment/pic/picRoutes');
const manageSopRoutes = require('./businessdevelopment/managesop/manageSopRoutes');
const ohSalespersonRoutes = require('./businessdevelopment/orderhivesalesperson/orderhiveSalespersonRoutes');
const employeeSnapshotRoutes = require('./businessdevelopment/employeesnapshot/employeeSnapshotRoutes');
const agentReconciliationRoutes = require('./businessdevelopment/agentreconciliation/agentReconciliationRoutes');
const byjusConfigRoutes = require('./byjusconfigmanagement/routes');
const gridTemplateRoutes = require('./supportmanagement/gridtemplate/gridTemplateRoutes');
const employeeReferralRoutes = require('./businessdevelopment/employeereferral/employeeReferralRoutes');
const batchRoutes = require('./batchmanagement/routes');
const vaultRoutes = require('./vault/routes');
const semanticRoutes = require('./semanticversionconfiguration/routes')

const apiRouter = express.Router();

module.exports = () =>
    apiRouter
        .use("/auth", authRoutes())
        .use("/mfa", mfaRoutes())
        .use("/developertoken", developerTokenRoutes())
        .use("/masteremployee", masterUserRoutes())
        .use("/ueemployee", ueUserRoutes())
        .use("/scemployee", scUserRoutes())
        .use("/financeemployee", financeUserRoutes())
        .use("/city", cityRoutes())
        .use("/organization", organizationRoutes())
        .use("/country", countryRoutes())
        .use("/group", groupRoutes())
        .use("/common", commonUserRoutes())
        .use('/permission', permissionRoutes())
        .use('/permission', permissionRoutes())
        .use('/v1/permission', permissionRoutesV1())
        .use('/hierarchy', hierarchyRoutes())
        .use('/hierarchy-beta', hierarchyBetaRoutes())
        .use('/v1/config', configurationBetaRoutes())
        .use('/enum', enumRoutes())
        .use('/language', languageRoutes())
        .use("/pic", picRoutes())
        .use("/orderhiveSalesperson", ohSalespersonRoutes())
        .use("/wfhattendance", wfhAttendanceRoutes())
        .use("/wfhattendanceworkflow", wfhAttendanceWorkflowRoutes())
        .use("/wfhtalktime", wfhTalkTimeRoutes())
        .use("/managesop", manageSopRoutes())
        .use("/agentreconciliation", agentReconciliationRoutes())
        .use("/assignmentrule", assignmentRuleRoutes())
        .use("/employeesnapshot", employeeSnapshotRoutes())
        .use("/employeereferral", employeeReferralRoutes())
        .use("/customerdemosessions", customerDemoSessionsRoutes())
        .use("/batchmanagement", batchRoutes())
        .use(userRoutes())
        .use(apptokenRoutes())
        .use(appRoleRoutes())
        .use(appUserRoutes())
        .use(allUserRoutes())
        .use(appGroupRoutes())
        .use(byjusConfigRoutes())
        .use(gridTemplateRoutes())
        .use(smsTemplateRoutes())
        .use(placeholderRoutes())
        .use(thirdpartyRoutes())
        .use(smsTransactionsRoutes())
        .use(smsProviderRoutes())
        .use("/vault", vaultRoutes())
        .use(semanticRoutes())
        .use("/v1/appgroup", appGroupBetaRoutes());
