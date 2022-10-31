import fetchIntercept from 'fetch-intercept';
import { find } from 'lodash';
import axios from 'axios';

const axiosInterceptLoginHandler = error => {
  if (
    error.response.status === 401 &&
    (error.response.headers && error.response.headers['x-redirect'])
  ) {
    window.localStorage.clear();
    window.location.reload();
  }
  return Promise.reject(error);
};

const axiosResponseInterceptor = () => {
  return axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      return axiosInterceptLoginHandler(error);
    }
  );
};

const axiosRequestInterceptor = () => {
  axios.interceptors.request.use(
    function (config) {
      const lsKeys = Object.keys(localStorage);
      const idTokenKey = find(lsKeys, elem => elem.includes('idToken'));
      const accessTokenKey = find(lsKeys, elem => elem.includes('accessToken'));
      const refreshTokenKey = find(lsKeys, elem =>
        elem.includes('refreshToken')
      );
      const impersonatedEmail = localStorage.getItem('x-impersonated-email');

      if (accessTokenKey && refreshTokenKey && config.headers) {
        config.headers['x-id-token'] = localStorage.getItem(idTokenKey);
        config.headers['x-access-token'] = localStorage.getItem(accessTokenKey);
        config.headers['x-refresh-token'] = localStorage.getItem(
          refreshTokenKey
        );
        if (impersonatedEmail) {
          config.headers['x-impersonated'] = true;
          config.headers['x-impersonated-email'] = impersonatedEmail;
        }
      }
      config.headers['x-app-origin'] = 'ums';
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
};

const fetchInterceptLoginHandler = responseObj => {
  if (responseObj.status === 401 && responseObj.headers.get('x-redirect')) {
    // console.log(
    //   'here in fetch response',
    //   responseObj.headers.get('x-redirect')
    // );
    window.localStorage.clear();
    if (responseObj.url.indexOf('/api/users/me') >= 0) {
      window.location = '/api/auth/google';
      return Promise.reject(null);
    } else {
      window.location.reload();
    }
  }
  return responseObj;
};

const getTokens = () => {
  const lsKeys = Object.keys(localStorage);
  const idTokenKey = find(lsKeys, elem => elem.includes('idToken'));
  const accessTokenKey = find(lsKeys, elem => elem.includes('accessToken'));
  const refreshTokenKey = find(lsKeys, elem => elem.includes('refreshToken'));

  const idToken = localStorage.getItem(idTokenKey);
  const accessToken = localStorage.getItem(accessTokenKey);
  const refreshToken = localStorage.getItem(refreshTokenKey);
  return { idToken, accessToken, refreshToken };
};

const addFetchInterceptor = () => {
  return fetchIntercept.register({
    request: function (url, config) {
      const { idToken, accessToken, refreshToken } = getTokens();
      const impersonatedEmail = localStorage.getItem('x-impersonated-email');
      if (accessToken && config && config.headers) {
        config.headers['x-id-token'] = idToken;
        config.headers['x-access-token'] = accessToken;
        config.headers['x-refresh-token'] = refreshToken;
        if (impersonatedEmail) {
          config.headers['x-impersonated'] = true;
          config.headers['x-impersonated-email'] = impersonatedEmail;
        }
      }
      config.headers['x-app-origin'] = 'ums';
      //console.log(config);
      return [url, config];
    },

    requestError: function (error) {
      return Promise.reject(error);
    },

    response: function (response) {
      return fetchInterceptLoginHandler(response);
    },

    responseError: function (error) {
      return Promise.reject(error);
    }
  });
};

axiosRequestInterceptor();
axiosResponseInterceptor();
addFetchInterceptor();
