import React from 'react';
import { Route } from 'react-router-dom';

import { hierarchy, setup } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import HierarchyGrids from './components/HierarchyDashboard';
import DepartmentList from './components/departments/DepartmentList';
import SubDepartmentList from './components/subdepartments/SubDepartmentList';
import UnitList from './components/units/UnitList';
import VerticalList from './components/verticals/VerticalList';
import CampaignList from './components/campaigns/CampaignList';
import TeamList from './components/TeamList';
import CityList from './components/cities/CityList';
import CountryList from './components/countries/CountryList';
import OrganizationList from './components/organizations/OrganizationList';
import LanguagesList from './components/languages/LanguageList';

import RolesList from '../roles/RoleList';
import EmployeeDetails from './components/EmployeeDetails';

const viewHierarchy = [
    hierarchy.viewDepartment,
    hierarchy.viewSubDepartment,
    hierarchy.viewUnit,
    hierarchy.viewVertical,
    hierarchy.viewCampaign,
    hierarchy.viewCity,
    hierarchy.viewCountry,
    hierarchy.viewLanguage,
];
const canViewHierarchyGrids = requireRole(viewHierarchy);
const canViewDepartmentGrid = requireRole(hierarchy.viewDepartment);
const canViewSubDepartmentGrid = requireRole(hierarchy.viewSubDepartment);
const canViewUnitGrid = requireRole(hierarchy.viewUnit);
const canViewVerticalGrid = requireRole(hierarchy.viewVertical);
const canViewCampaignGrid = requireRole(hierarchy.viewCampaign);
const canViewCityGrid = requireRole(hierarchy.viewCity);
const canViewCountryGrid = requireRole(hierarchy.viewCountry);
const canViewOrganizationGrid = requireRole(setup.viewOrganization);
const canViewRoleGrid = requireRole(hierarchy.viewRole);
const canViewTeamGrid = requireRole(hierarchy.viewTeam);
const canViewLanguageGrid = requireRole(hierarchy.viewLanguage);

const HierarchyRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewHierarchyGrids(HierarchyGrids)} />
        <Route path={`${match.url}/departments`} exact component={canViewDepartmentGrid(DepartmentList)} />
        <Route path={`${match.url}/subdepartments/:subDepartment/team/employee/:_id`} exact component={canViewTeamGrid(EmployeeDetails)} />
        <Route path={`${match.url}/subdepartments/:subDepartment/team`} exact component={canViewTeamGrid(TeamList)} />
        <Route path={`${match.url}/subdepartments/:subDepartment/role`} exact component={canViewRoleGrid(RolesList)} />
        <Route path={`${match.url}/subdepartments`} exact component={canViewSubDepartmentGrid(SubDepartmentList)} />
        <Route path={`${match.url}/units`} exact component={canViewUnitGrid(UnitList)} />
        <Route path={`${match.url}/verticals`} exact component={canViewVerticalGrid(VerticalList)} />
        <Route path={`${match.url}/campaigns`} exact component={canViewCampaignGrid(CampaignList)} />
        <Route path={`${match.url}/cities`} exact component={canViewCityGrid(CityList)} />
        <Route path={`${match.url}/countries`} exact component={canViewCountryGrid(CountryList)} />
        <Route path={`${match.url}/organizations`} exact component={canViewOrganizationGrid(OrganizationList)} />
        <Route path={`${match.url}/languages`} exact component={canViewLanguageGrid(LanguagesList)} />
    </SwitchWithNotFound>
);

export default HierarchyRouter;

