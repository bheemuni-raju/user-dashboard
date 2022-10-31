import React from 'react';
import { Route } from 'react-router-dom';

import { sales } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import DemoSessionsList from './components/DemoSessionsList';

const canViewCustomerDemoSessionDashboard = requireRole(sales.customerDemoSessionCard);

const CustomerDemoSessionsRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}/demo-sessions-list`} exact component={canViewCustomerDemoSessionDashboard(DemoSessionsList)} />
    </SwitchWithNotFound>
);

export default CustomerDemoSessionsRouter;