import React from "react";
import { Route, useRouteMatch } from "react-router-dom";

import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { deploymentRequest } from 'lib/permissionList';
import DeploymentRequestDetails from './Details';

const canViewDrGrid = requireRole([deploymentRequest.viewDeploymentRequest]);

const DeploymentRequestRouter = (props) => {
    const match = useRouteMatch();
    const refreshGrid = props.refreshGrid;
    const DeploymentDetailsView = canViewDrGrid(props => <DeploymentRequestDetails {...props} refreshGrid={refreshGrid} />);

    return (
        <SwitchWithNotFound>
            <Route path={`${match.url}/:drId`} exact component={DeploymentDetailsView} />
        </SwitchWithNotFound>
    )
};

export default DeploymentRequestRouter;