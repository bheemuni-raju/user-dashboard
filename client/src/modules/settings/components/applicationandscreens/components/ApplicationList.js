import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import PermissionModuleList from './PermissionModuleList';
import { Box, BoxHeader, BoxBody } from 'components/box';
import TabBuilder from 'modules/core/components/TabBuilder';
import { configurePermission, validatePermission } from 'lib/permissionList';

const ApplicationList = (props) => {

    let { user } = props;

    const viewAllApplication = validatePermission(user, get(configurePermission, 'viewAllApplication'));
    const viewCommonApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewCommonApplication'));
    const viewOmsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewOmsApplication'));
    const viewUmsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewUmsApplication'));
    const viewLmsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewLmsApplication'));
    const viewImsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewImsApplication'));
    const viewMiddleWareApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewMiddleWareApplication'));
    const viewAchieveApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewAchieveApplication'));
    const viewPaymentApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewPaymentApplication'));
    const viewMentoringApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewMentoringApplication'));
    const viewPomsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewPomsApplication'));
    const viewFmsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewFmsApplication'));
    const viewWmsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewWmsApplication'));
    const viewCxmsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewCxmsApplication'));
    const viewScAchieveApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewScAchieveApplication'));
    const viewScosApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewScosApplication'));
    const viewSosApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewSosApplication'));
    const viewCounsellingApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewCounsellingApplication'));
    const viewUxAchieveApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewUxAchieveApplication'));
    const viewDfosApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewDfosApplication'));
    const viewDfAchieveApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewDfAchieveApplication'));
    const viewStmsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewStmsApplication'));
    const viewComplianceApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewComplianceApplication'));
    const viewCnsApplication = viewAllApplication || validatePermission(user, get(configurePermission, 'viewCnsApplication'));
    const tabs = [];

    if (viewCommonApplication) {
        tabs.push({
            title: "Common(OMS,LMS,UMS)",
            component: <PermissionModuleList appName={"common"} />
        });
    }

    if (viewOmsApplication) {
        tabs.push({
            title: "OMS",
            component: <PermissionModuleList appName={"oms"} />
        });
    }

    if (viewUmsApplication) {
        tabs.push({
            title: "UMS",
            component: <PermissionModuleList appName={"ums"} />
        });
    }

    if (viewLmsApplication) {
        tabs.push({
            title: "LMS",
            component: <PermissionModuleList appName={"lms"} />
        });
    }

    if (viewImsApplication) {
        tabs.push({
            title: "IMS",
            component: <PermissionModuleList appName={"ims"} />
        });
    }

    if (viewMiddleWareApplication) {
        tabs.push({
            title: "Middleware",
            component: <PermissionModuleList appName={"middleware"} />
        });
    }

    if (viewAchieveApplication) {
        tabs.push({
            title: "Achieve",
            component: <PermissionModuleList appName={"achieve"} />
        });
    }

    if (viewPaymentApplication) {
        tabs.push({
            title: "Payment",
            component: <PermissionModuleList appName={"payment"} />
        });
    }

    if (viewMentoringApplication) {
        tabs.push({
            title: "Mentoring",
            component: <PermissionModuleList appName={"mentoring"} />
        });
    }

    if (viewPomsApplication) {
        tabs.push({
            title: "POMS",
            component: <PermissionModuleList appName={"poms"} />
        });
    }

    if (viewFmsApplication) {
        tabs.push({
            title: "FMS",
            component: <PermissionModuleList appName={"fms"} />
        });
    }

    if (viewWmsApplication) {
        tabs.push({
            title: "WMS",
            component: <PermissionModuleList appName={"wms"} />
        });
    }

    if (viewCxmsApplication) {
        tabs.push({
            title: "CXMS",
            component: <PermissionModuleList appName={"cxms"} />
        });
    }

    if (viewScAchieveApplication) {
        tabs.push({
            title: "SCAchieve",
            component: <PermissionModuleList appName={"scachieve"} />
        });
    }

    if (viewScosApplication) {
        tabs.push({
            title: "SCOS",
            component: <PermissionModuleList appName={"scos"} />
        });
    }

    if (viewSosApplication) {
        tabs.push({
            title: "SOS",
            component: <PermissionModuleList appName={"sos"} />
        });
    }

    if (viewCounsellingApplication) {
        tabs.push({
            title: "Counselling",
            component: <PermissionModuleList appName={"counselling"} />
        });
    }

    if (viewUxAchieveApplication) {
        tabs.push({
            title: "UXAchieve",
            component: <PermissionModuleList appName={"uxachieve"} />
        });
    }

    if (viewCommonApplication) {
        tabs.push({
            title: "ExMS",
            component: <PermissionModuleList appName={"exms"} />
        });
    }
    if (viewCommonApplication) {
        tabs.push({
            title: "MOS",
            component: <PermissionModuleList appName={"mos"} />
        });
    }
    if (viewDfosApplication) {
        tabs.push({
            title: "DFOS",
            component: <PermissionModuleList appName={"dfos"} />
        });
    }
    if (viewDfAchieveApplication) {
        tabs.push({
            title: "DFAchieve",
            component: <PermissionModuleList appName={"dfachieve"} />
        });
    }
    if (viewStmsApplication) {
        tabs.push({
            title: "STMS",
            component: <PermissionModuleList appName={"stms"} />
        });
    }
    if (viewComplianceApplication) {
        tabs.push({
            title: "Compliance",
            component: <PermissionModuleList appName={"compliance"} />
        });
    }
    if (viewCnsApplication) {
        tabs.push({
            title: "CNS",
            component: <PermissionModuleList appName={"cns"} />
        });
    }
    return (
        <Box>
            <BoxHeader heading="Applications & Screens" />
            <BoxBody>
                <TabBuilder tabs={tabs} />
            </BoxBody>
        </Box>
    )
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(ApplicationList)
