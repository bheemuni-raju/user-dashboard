import React from 'react';

import TabBuilder from 'modules/core/components/TabBuilder';
import { Page, PageHeader, PageBody } from 'components/page';
import DepartmentList from './departments/DepartmentList';
import SubDepartment from './subdepartments/SubDepartmentList';
import UnitList from './units/UnitList';
import VerticalList from './verticals/VerticalList';
import CampaignList from './campaigns/CampaignList';
import CityList from './cities/CityList';
import CountryList from './countries/CountryList';
import { hierarchy } from 'lib/permissionList';

const HierarchyDashboard = (props) => {
    const { history } = props;

    const viewDepartment = [hierarchy.viewDepartment];
    const viewSubDepartment = [hierarchy.viewSubDepartment];
    const viewUnit = [hierarchy.viewUnit];
    const viewVertical = [hierarchy.viewVertical];
    const viewCampaign = [hierarchy.viewCampaign];
    const viewCity = [hierarchy.viewCity];
    const viewCountry = [hierarchy.viewCountry];

    const tabs = [{
        icon: "bjs-department",
        title: "Department",
        component: <DepartmentList history={history} />,
        isAllowed: viewDepartment

    }, {
        icon: "bjs-sub-department",
        title: "SubDepartment",
        component: <SubDepartment history={history} />,
        isAllowed: viewSubDepartment
    }, {
        icon: "bjs-department",
        title: "Unit",
        component: <UnitList history={history} />,
        isAllowed: viewUnit
    }, {
        icon: "bjs-vertical",
        title: "Vertical",
        component: <VerticalList history={history} />,
        isAllowed: viewVertical
    }, {
        icon: "bjs-campaign",
        title: "Campaign",
        component: <CampaignList history={history} />,
        isAllowed: viewCampaign
    }, {
        icon: "bjs-city",
        title: "City",
        component: <CityList history={history} />,
        isAllowed: viewCity
    }, {
        icon: "bjs-city",
        title: "Country",
        component: <CountryList history={history} />,
        isAllowed: viewCountry
    }];

    return (
        <Page>
            <PageHeader heading="Hierarchy Setup" />
            <PageBody>
                <TabBuilder tabs={tabs} />
            </PageBody>
        </Page>
    )
}

export default HierarchyDashboard;
