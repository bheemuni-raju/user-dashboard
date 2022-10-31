import React from "react";
import { connect } from 'react-redux';

import CardLayout from "components/CardLayout";
import { businessDevelopment, validatePermission } from 'lib/permissionList';

const SalesLandingPage = (props) => {
    const viewBDGrid = validatePermission(props.user, businessDevelopment.viewBDEmployees);
    const viewBDSummary = validatePermission(props.user, businessDevelopment.viewBDSummary);

    let cards = [{
        title: 'Manage Employees',
        items: [{
            title: 'BD Employees',
            url: '/business-development/dashboard',
            icon: 'bjs-sales-employees1',
            isAllowed: viewBDGrid
        }, {
            title: 'Sales Employees Summary',
            url: '/business-development/sales-summary',
            icon: 'bjs-sales-employee-summary',
            isAllowed: viewBDSummary
        }]
    }];

    return (
        <CardLayout cards={cards} heading="Business Development" />
    );
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(SalesLandingPage)
