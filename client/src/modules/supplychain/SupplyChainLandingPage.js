import React, { Component, Fragment } from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { get } from 'lodash';

import CardLayout from "components/CardLayout";
import { supplyChain, validatePermission } from 'lib/permissionList';

const SupplyChainLandingPage = (props) => {

    const viewScGrid = validatePermission(props.user, [supplyChain.viewScEmployees]);
    const viewScSummary = validatePermission(props.user, supplyChain.viewScSummary);
    const viewScAttendancePortal = validatePermission(props.user, supplyChain.viewScAttendancePortal);
    const viewScAttendanceWorkflow = validatePermission(props.user, supplyChain.viewScAttendanceWorkflow);
    const viewScTalktime = validatePermission(props.user, supplyChain.viewScTalktime);
    const viewScDayOff = validatePermission(props.user, supplyChain.viewScDayOff);
    const viewScAttendanceSummary = validatePermission(props.user, supplyChain.viewScAttendanceSummary);

    const cards = [{
        title: 'Supply Chain',
        items: [{
            title: 'SC Employees',
            url: '/supply-chain/dashboard',
            icon: 'bjs-supply-chain-employees',
            isAllowed: viewScGrid
        }, {
            title: 'SC Employees Summary',
            url: '/supply-chain/sc-summary',
            icon: 'bjs-sc-achieve-summary',
            isAllowed: viewScSummary
        }]
    }, {
        title: 'Manage Attendance',
        items: [{
            title: 'Attendance Portal',
            url: '/supply-chain/attendance-portal/attendance',
            icon: 'bjs-ums-attendance-portal',
            isAllowed: viewScAttendancePortal
        }, {
            title: 'Attendance Workflow',
            url: '/supply-chain/attendance-portal/attendance-workflow',
            icon: 'bjs-ums-attendance-workflow',
            isAllowed: viewScAttendanceWorkflow
        }, {
            title: 'TalkTime',
            url: '/supply-chain/attendance-portal/talktime',
            icon: 'bjs-wfh-web-talktime',
            isAllowed: viewScTalktime
        }, {
            title: 'Day Off',
            url: '/supply-chain/attendance-portal/day-off',
            icon: 'bjs-day-off',
            isAllowed: viewScDayOff
        }, {
            title: 'Attendance Summary',
            url: '/supply-chain/attendance-portal/sc-attendance-summary',
            icon: 'bjs-ums-attendance-summary-supply-chain',
            isAllowed: viewScAttendanceSummary
        }]
    }];

    return (
        <CardLayout cards={cards} heading="Supply Chain" />
    );
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(SupplyChainLandingPage)
