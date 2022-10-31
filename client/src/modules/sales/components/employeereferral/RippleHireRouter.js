import React from 'react';
import { Route } from 'react-router-dom';

import { sales } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import RippleHireList from './components/dashboard/RippleHireList';

const canViewRippleHireDashboard = requireRole(sales.rippleHireCard);

const RippleHireRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}/ripplehire-list`} exact component={canViewRippleHireDashboard(RippleHireList)} />
    </SwitchWithNotFound>
);

export default RippleHireRouter;