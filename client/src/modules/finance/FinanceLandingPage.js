import React, { Component, Fragment } from "react";
import { connect } from 'react-redux';

import CardLayout from "components/CardLayout";
import { finance, validatePermission } from 'lib/permissionList';

const FinanceLandingPage = (props) => {
    const viewFinanceGrid = validatePermission(props.user, [finance.viewFinanceEmployees]);

    const cards = [{
        title: 'Finance',
        items: [{
            title: 'Finance Employees',
            url: '/finance/dashboard',
            icon: 'bjs-finance-employees',
            isAllowed: viewFinanceGrid
        }]
    }];

    return (
        <CardLayout cards={cards} heading="Finance" />
    );
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(FinanceLandingPage)
