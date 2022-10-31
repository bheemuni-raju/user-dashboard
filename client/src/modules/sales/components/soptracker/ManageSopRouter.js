import React from 'react';
import { Route } from 'react-router-dom';

import { sales } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import SopTracker from './components/SopTracker';
import DownloadReport from './components/DownloadReport';
import PerformanceRatingSummary from './components/PerformanceRatingSummary';

const canViewAttritionDashboard = requireRole(sales.attritionCard);

const ManageSopRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={`${match.url}/sop-tracker`} exact component={canViewAttritionDashboard(SopTracker)} />
        <Route path={`${match.url}/performance-rating-summary`} exact component={canViewAttritionDashboard(PerformanceRatingSummary)} />
        <Route path={`${match.url}/download-report`} exact component={canViewAttritionDashboard(DownloadReport)} />
    </SwitchWithNotFound>
);

export default ManageSopRouter;