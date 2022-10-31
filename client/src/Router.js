import React, { Suspense } from 'react';
import { ConnectedRouter } from "connected-react-router";
import { connect } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { Container } from 'reactstrap';
import Notify from 'react-s-alert';
import { AppFooter, AppHeader } from '@byjus-orders/uikit-react';

import { isEmpty } from 'lodash';
import selectors from "./store/selectors";
import { navConfig } from './_nav';
import requireRole from "./components/router/requireRole";
import CustomView from "modules/core/components/customview/CustomView";
import CompactSidebar from 'containers/DefaultLayout/CompactSideBar';
import { user } from 'lib/permissionList';

const DefaultFooter = React.lazy(() => import('./containers/DefaultLayout/DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./containers/DefaultLayout/DefaultHeader'));

const Home = React.lazy(() => import("./modules/core/components/Home"));
const Dashboard = React.lazy(() => import("./modules/dashboard/DashboardRouter"));
const Impersonate = React.lazy(() => import('./modules/user/components/Impersonate'));
const Profile = React.lazy(() => import('./modules/user/components/Profile'));
const SalesRouter = React.lazy(() => import('./modules/sales/SalesRouter'));
const UserExperienceRouter = React.lazy(() => import('./modules/userexperience/UserExperienceRouter'));
const SupplyChainRouter = React.lazy(() => import('./modules/supplychain/SupplyChainRouter'));
const FinanceRouter = React.lazy(() => import('./modules/finance/FinanceRouter'));
const BatchRouter = React.lazy(() => import('./modules/batch/BatchRouter'));
const SettingsRouter = React.lazy(() => import('./modules/settings/SettingsRouter'));
const AnalyticsRouter = React.lazy(() => import('./modules/analytics/AnalyticsRouter'));

// Pages
const Login = React.lazy(() => import('./modules/user/components/Login'));

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
const canImpersonateUser = requireRole(user.impersonate);

const DefaultLayout = (props) => {
  const showProfile = !isEmpty(props.user.appName);

  return (
    <div className="app">
      <div className="app-body">
        <CompactSidebar user={props.user} navConfig={navConfig(props.user)} location={props.history.location} />
        <main className="main">
          <AppHeader fixed>
            <Suspense fallback={loading()}>
              <DefaultHeader />
            </Suspense>
          </AppHeader>
          <Container fluid className="mt-5">
            <Notify
              offset={50}
              position={'top-right'}
              timeout={5000}
              effect={'flip'}
              stack={{ limit: 3 }}
              html={true}
            />
            <React.Suspense fallback={loading()}>
              <Switch>
                <Route exact path="/users/impersonate" component={canImpersonateUser(Impersonate)} />
                {showProfile && <Route exact path="/users/profile" component={Profile} />}
                <Route exact path="/home" component={Home} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/business-development" component={SalesRouter} />
                <Route path="/user-experience" component={UserExperienceRouter} />
                <Route path="/supply-chain" component={SupplyChainRouter} />
                <Route path="/finance" component={FinanceRouter} />
                <Route path="/batch" component={BatchRouter} />
                <Route path="/settings" component={SettingsRouter} />
                <Route path="/analytics" component={AnalyticsRouter} />
                <Route exact path="/custom-views/new" component={CustomView} />
                <Route exact path="/custom-views/:viewId/edit" component={CustomView} />
                <Redirect from="/" to="/dashboard" />
              </Switch>
            </React.Suspense>
          </Container>
        </main>
      </div>
      <AppFooter>
        <Suspense fallback={loading()}>
          <DefaultFooter />
        </Suspense>
      </AppFooter>
    </div>
  )
}

const Router = ({ history, user }) => (
  <ConnectedRouter history={history}>
    <React.Suspense fallback={loading()}>
      <Switch>
        <Route path="/" name="Login Page" render={props => {
          if (user) {
            return <DefaultLayout {...props} user={user} />
          }
          else {
            return <Redirect from="/" to="/login" />
          }
        }} />
      </Switch>
    </React.Suspense>
  </ConnectedRouter>
);

const mapStateToProps = state => ({
  user: selectors.auth.getUser(state)
});

export default connect(mapStateToProps)(Router);