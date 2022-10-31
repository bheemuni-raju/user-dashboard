import React from 'react';
import { Route } from 'react-router-dom';

import { sales } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import AttritionList from './components/dashboard/AttritionList';

const canViewAttritionDashboard = requireRole(sales.attritionCard);

const AttritionRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}/attrition-list`} exact component={canViewAttritionDashboard(AttritionList)} />
    </SwitchWithNotFound>
);

export default AttritionRouter;