import { get, flattenDeep, map, union } from 'lodash';
import { CALL_API, callApi } from 'store/middleware/api';

export const SIGNIN_REQUEST = 'auth/SIGNIN_REQUEST';
export const SIGNIN_SUCCESS = 'auth/SIGNIN_SUCCESS';
export const SIGNIN_FAILURE = 'auth/SIGNIN_FAILURE';
export const LOAD_REQUEST = 'auth/LOAD_REQUEST';
export const LOAD_SUCCESS = 'auth/LOAD_SUCCESS';
export const LOAD_FAILURE = 'auth/LOAD_FAILURE';
export const IMPERSONATE_REQUEST = 'auth/IMPERSONATE_REQUEST';
export const IMPERSONATE_SUCCESS = 'auth/IMPERSONATE_SUCCESS';
export const IMPERSONATE_FAILURE = 'auth/IMPERSONATE_FAILURE';

const loadImpersonateRequest = () => ({ type: IMPERSONATE_REQUEST });
const successImpersonateRequest = (response) => ({ type: IMPERSONATE_SUCCESS, response });
const failureImpersonateRequest = (error) => ({ type: IMPERSONATE_FAILURE, error });

export const signIn = credentials => ({
  [CALL_API]: {
    endpoint: 'auth/signin',
    method: 'POST',
    body: credentials,
    types: [SIGNIN_REQUEST, SIGNIN_SUCCESS, SIGNIN_FAILURE]
  }
});

export const loadUser = () => ({
  [CALL_API]: {
    endpoint: '/usermanagement/employee/getUserProfile',
    types: [LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE],
    isUmsServerlessEndpoint: true,
    isNucleusApi: true
  }
});

// export const loadImpersonateUser = user => ({
//   [CALL_API]: {
//     endpoint: `/usermanagement/employee/getByEmail/${user}`,
//     method: 'GET',
//     types: [IMPERSONATE_REQUEST, IMPERSONATE_SUCCESS, IMPERSONATE_FAILURE],
//     isNucleusApi: true
//   }
// });

export const loadImpersonateUser = (user, reactHistory) => dispatch => {
  dispatch(loadImpersonateRequest());

  return callApi(`/usermanagement/employee/getByEmail`, 'POST', { "email": user }, null, null, true)
    .then((response) => {
      dispatch(successImpersonateRequest(response));
      localStorage.setItem('x-impersonated-email', user);
      reactHistory && reactHistory.push('/');
    }).catch((error) => {
      console.log(error);
      dispatch(failureImpersonateRequest(error));
    });
}

const initFreshchat = async (user) => {
  const { env } = user;

  if (env === "production") {
    window.initiateCall();
    setTimeout(async () => {
      await setUserDetailsToChatWindow(user);
    }, 2000);
  }
}

const setUserDetailsToChatWindow = async (user) => {
  const { email, name } = user;

  // To set unique user id in your system when it is available
  window.fcWidget.setExternalId(email);
  if (window.fcWidget && window.fcWidget.user) {
    // To set user name
    window.fcWidget.user.setFirstName(name);

    // To set user email
    window.fcWidget.user.setEmail(email);

    // To set user properties
    await window.fcWidget.user.setProperties({
      appName: 'ums',
      name: user.name,
      campaign: user.campaign,
      location: user.location,
      role: user.roleFormattedName || user.role,
      department: user.departmentFormattedName || user.department,
      subDepartment: user.subDepartmentFormattedName || user.subDepartment,
      contact: user.contact ? user.contact.join && user.contact.join() : ''
    });
  }
}

export default (state = { user: null, impersonateUser: null }, action) => {
  switch (action.type) {
    case SIGNIN_REQUEST:
    case IMPERSONATE_REQUEST:
    case LOAD_REQUEST:
      return {
        ...state,
        success: null,
        error: null,
        fetching: true
      };
    case SIGNIN_SUCCESS:
    case LOAD_SUCCESS:
      initFreshchat(action.response || state.user)
      return {
        ...state,
        fetching: false,
        success: true,
        user: (action.response) || (state.user),
        originalUser: (action.response) || (state.user),
        error: null
      };
    case IMPERSONATE_SUCCESS:
      return {
        ...state,
        fetching: false,
        success: true,
        isImpersonateUserExists: true,
        impersonateUser: (action.response) || (state.impersonateUser),
        user: (action.response) || (state.impersonateUser),
        error: null
      };
    case SIGNIN_FAILURE:
    case LOAD_FAILURE:
    case IMPERSONATE_FAILURE:
      return {
        ...state,
        fetching: false,
        success: null,
        error: action.error
      };
    default:
      return state;
  }
};

const getFormattedResponse = user => {
  if (user) {
    const userPermissions = extractPermissions(user);
    const departmentPermissions = user && extractPermissions(user.department);
    const rolePermissions = user && extractPermissions(user.role);
    /**Merging permissions of User, department and Role */
    const mergedPermissions =
      flattenDeep(userPermissions, departmentPermissions, rolePermissions) ||
      [];
    user['permissions'] = mergedPermissions;
  }
  return user;
};

const extractPermissions = entity => {
  let userPermissions = [];
  if (
    entity &&
    entity.permission_template &&
    entity.permission_template.length > 0
  ) {
    const permissionsArray = map(entity.permission_template, 'permissions');
    userPermissions = union(...permissionsArray);
  }
  return userPermissions;
};

export const createSelectors = path => ({
  getUser: state => get(state, path).user,
  getImpersonateUser: state => get(state, path).impersonateUser,
  fetching: state => get(state, path).fetching,
  error: state => get(state, path).error,
  success: state => get(state, path).success
});
