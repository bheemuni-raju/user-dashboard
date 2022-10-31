import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createBrowserHistory as createHistory } from 'history';
import ReactGA from 'react-ga';

import 'react-dates/initialize';
import 'jquery';
import 'bootstrap';
import 'react-select/dist/react-select';
import "antd/dist/antd.css";

import './index.scss';
import './Interceptor';

import createStore from './store';
import Application from './Application';

import * as serviceWorker from './serviceWorker';

const history = createHistory({});
const store = createStore(history);

const appConfigMap = {
  'dev-users.byjusorders.com': {
    url : 'https://dev-nucleus.byjusorders.com/nucleusapi',
    umsServerlessUrl: '',
    gaTrackingId : 'UA-146798497-7'
  },
  'dev-developers.byjusorders.com': {
    url : 'https://dev-nucleus.byjusorders.com/nucleusapi',
    umsServerlessUrl: '',
    gaTrackingId : 'UA-146798497-7'
  },
   'uat-users.byjusorders.com': {
    url : 'https://uat-nucleus.byjusorders.com/nucleusapi',
    umsServerlessUrl: '',
    gaTrackingId : 'UA-146798497-2'
  },
  'staging-users.byjusorders.com': {
    url : 'https://staging-nucleus.byjusorders.com/nucleusapi',
    umsServerlessUrl: '',
    gaTrackingId : 'UA-146798497-2'
  },
  'developers.byjusorders.com': {
    url : 'https://nucleus.byjusorders.com/nucleusapi',
    umsServerlessUrl: '',
    gaTrackingId : 'UA-146798497-12'
  },
  'users.byjusorders.com': {
    url : 'https://nucleus.byjusorders.com/nucleusapi',
    umsServerlessUrl: '',
    gaTrackingId : 'UA-146798497-12'
  },
  localhost: {
    url : 'http://localhost:3000/nucleusapi',
    umsServerlessUrl: '',
    gaTrackingId : 'UA-146798497-2'
  }
};

const host = window.location.host;
const currentAppConfig = host ? appConfigMap[host] : appConfigMap['localhost'];

window.NAPI_URL = currentAppConfig.url;
window.UMS_SERVERLESS_URL = currentAppConfig.umsServerlessUrl;

ReactGA.initialize(currentAppConfig.gaTrackingId);

// Initialize google analytics page view tracking
history.listen(location => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

ReactDOM.render(
  <Provider store={store}>
    <Application history={history} />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
