import React from 'react';
import { NavLink } from 'react-router-dom';
import { batch, hierarchy, group, permissionTemplate, permissionModule, businessDevelopment, userExperience, supplyChain, finance, settings, analytics, user, validatePermission, deploymentRequest, assignmentRule, appToken, maintenance } from 'lib/permissionList';

import sygnet from 'assets/img/brand/ums-logo.svg';
import { concat } from 'lodash';

const CompactSidebar = (props) => {
    const { user } = props;

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
    const canViewAnalytics = validatePermission(user, viewAnalytics);

    const viewBD = [
        businessDevelopment.viewBDEmployees,
        businessDevelopment.viewBDSummary
    ];
    const canViewBD = validatePermission(user, viewBD);

    const viewUX = [
        userExperience.viewUxEmployees
    ];
    const canViewUX = validatePermission(user, viewUX);

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
    const canViewSC = validatePermission(user, viewSC);

    const viewFinance = [
        finance.viewFinanceEmployees
    ];
    const canViewFinance = validatePermission(user, viewFinance);

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
    const canViewBatch = validatePermission(user, viewBatch);

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
    ];

    const viewSettings = concat(viewMaster, viewHierarchy, viewGroups, viewAssignmentRule, viewPermissions, viewScreens, viewAppToken, viewAppUser, viewAppRole, viewAppGroup, viewCacheConfig, viewAppConfig, viewGridConfig);
    const canViewSettings = validatePermission(user, viewSettings);

    return (
        <nav className="navbar navbar-default navbar-primary">
            <div className="navbar-logo">
                <NavLink to={"/dashboard"} className="navbar-primary-item-link icon">
                    <img src={sygnet} />
                </NavLink>
            </div>
            <ul className="nav navbar-nav nav-pills navbar-primary-list">
                <li className="navbar-primary-item" data-toggle="tooltip" title="Dashboard">
                    <NavLink to={"/dashboard"} className="navbar-primary-item-link icon">
                        <i className="bjs-dashboard"></i>
                    </NavLink>
                </li>
                {canViewAnalytics && <li className="navbar-primary-item" data-toggle="tooltip" title="Analytics">
                    <NavLink to={"/analytics"} className="navbar-primary-item-link icon">
                        <i className="bjs-ums-analytics"></i>
                    </NavLink>
                </li>}
                {/* {canViewBD && <li className="navbar-primary-item" data-toggle="tooltip" title="Business Development">
                    <NavLink to={"/business-development"} className="navbar-primary-item-link icon">
                        <i className="bjs-sales-dashboard"></i>
                    </NavLink>
                </li>}
                {canViewUX && <li className="navbar-primary-item" data-toggle="tooltip" title="User Experience">
                    <NavLink to={"/user-experience"} className="navbar-primary-item-link icon">
                        <i className="bjs-ux-dashboard-01"></i>
                    </NavLink>
                </li>} */}
                {canViewSC && <li className="navbar-primary-item" data-toggle="tooltip" title="Supply Chain">
                    <NavLink to={"/supply-chain"} className="navbar-primary-item-link icon">
                        <i className="bjs-sc-dashboard"></i>
                    </NavLink>
                </li>}
                {canViewFinance && <li className="navbar-primary-item" data-toggle="tooltip" title="Finance">
                    <NavLink to={"/finance"} className="navbar-primary-item-link icon">
                        <i className="bjs-finance-dashboard1"></i>
                    </NavLink>
                </li>}
                {canViewBatch && <li className="navbar-primary-item" data-toggle="tooltip" title="Reports and Jobs">
                    <NavLink to={"/batch"} className="navbar-primary-item-link icon">
                        <i className="bjs-reports-and-jobs"></i>
                    </NavLink>
                </li>}
                {canViewSettings && <li className="navbar-primary-item" data-toggle="tooltip" title="Settings">
                    <NavLink to={"/settings"} className="navbar-primary-item-link icon">
                        <i className="bjs-settings"></i>
                    </NavLink>
                </li>
                }
            </ul>
        </nav>
    )
}

export default CompactSidebar;