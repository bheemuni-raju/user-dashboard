import React from "react";
import { connect } from 'react-redux';
import { get } from 'lodash';

import CardLayout from "components/CardLayout";
import { userExperience, validatePermission } from 'lib/permissionList';

const UserExperienceLandingPage = (props) => {
    const viewUxGrid = get(userExperience, 'viewUxEmployees');
    const viewUserExpDashboard = validatePermission(props.user, [viewUxGrid]);

    const cards = [{
        title: 'User Experience',
        items: [{
            title: 'UX Employees',
            url: '/user-experience/dashboard',
            icon: 'bjs-ux-employees',
            isAllowed: viewUserExpDashboard
        }]
    }];

    return (
        <CardLayout cards={cards} heading="User Experience" />
    );
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(UserExperienceLandingPage)
