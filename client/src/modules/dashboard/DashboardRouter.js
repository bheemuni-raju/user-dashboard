import React from "react";
import { Route, NavLink, Redirect } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Nav, NavItem, TabPane, TabContent } from 'reactstrap';

import requireRole from 'components/router/requireRole';
import SwitchWithNotFound from "components/router/SwitchWithNotFound";
import { dashboard, validatePermission } from 'lib/permissionList';

import UmsDashboard from "./UmsDashboard";
import UserDashboard from "./user/UserDashboard";
import DeploymentRequestDashboard from "./devopsinfrarequest/Dashboard";

const DashboardRouter = ({ match }) => {
    const user = useSelector(state => state.auth.user);
    const canViewUserDashboard = requireRole(dashboard.viewUserDashboard);

    const viewUserDashboard = validatePermission(user, dashboard.viewUserDashboard);
    const showDashboard = [viewUserDashboard].includes(true) ? true : false;

    return (
        <>
            <Nav tabs>
                {viewUserDashboard &&
                    <>
                        <NavItem>
                            <NavLink to="/dashboard/user" className="nav-link">User Dashboard</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to="/dashboard/devops-infra-request" className="nav-link">DevOps Infra Request Dashboard</NavLink>
                        </NavItem>
                    </>
                }
            </Nav>
            {showDashboard ?
                <TabContent id="react-tabs">
                    <TabPane>
                        <SwitchWithNotFound>
                            <Route path={`${match.url}/user`} exact component={canViewUserDashboard(UserDashboard)} />
                            <Route path={`${match.url}/devops-infra-request`} exact component={canViewUserDashboard(DeploymentRequestDashboard)} />
                            {viewUserDashboard && <Redirect from="/" to={`${match.url}/user`} />}
                        </SwitchWithNotFound>
                    </TabPane>
                </TabContent> :
                <UmsDashboard />
            }
        </>
    )
}

export default DashboardRouter;
