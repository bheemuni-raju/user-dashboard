import React from 'react';

import TabBuilder from 'modules/core/components/TabBuilder';
import { Page, PageHeader, PageBody } from 'components/page';
import RoleList from './roles/RoleList';
import { hierarchy } from 'lib/permissionList';
import AppRoleList from './approle/components/AppRoleList';
import AppGroupList from './appgroup/AppGroupList';

const ConfigurationDashboard = (props) => {
    const { history } = props;

    const viewRole = [hierarchy.viewRole];
    const viewAppRole = [hierarchy.viewAppRole];
    const viewAppGroup = [hierarchy.viewAppGroup];
    const tabs = [{
        icon: "bjs-role",
        title: "Role",
        component: <RoleList history={history} />,
        isAllowed: viewRole

    },{
        icon: "bjs-app-tokens",
        title: "Application Roles",
        component: <AppRoleList history={history} />,
        isAllowed: viewAppRole
    },{
        icon: "bjs-app-tokens",
        title: "Application Groups",
        component: <AppGroupList history={history} />,
        isAllowed: viewAppGroup
    }];

    return (
        <Page>
            <PageHeader heading="Configuration" />
            <PageBody>
                <TabBuilder tabs={tabs} />
            </PageBody>
        </Page>
    )
}

export default ConfigurationDashboard;
