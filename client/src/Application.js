import React, { Component, createContext } from 'react';
import { connect } from 'react-redux';
import Amplify, { Auth, Hub } from 'aws-amplify';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import Router from './Router';
import OAuthButton from './modules/user/components/OAuthButton';
import { loadUser } from './modules/user/authReducer';
import { callApi } from 'store/middleware/api';
import MultiFactorAuth from 'modules/user/components/MultiFactorAuth';

import ServerError from './modules/core/components/errors/ServerError';
import awsmobile from './aws-exports';
import { checkMultiFactorAuth, getMfaUserToken } from './modules/user/utils/userUtil';
import { datadogRum } from '@datadog/browser-rum';

const oauth = {
  domain: 'byjusdevauth.byjusorders.com',
  scope: [
    'phone',
    'email',
    'profile',
    'openid',
    'aws.cognito.signin.user.admin'
  ],
  redirectSignIn: `${window.location.origin}/callback`,
  redirectSignOut: `${window.location.origin}`,
  responseType: 'code' // or token
};

Amplify.configure(awsmobile);
Auth.configure({ oauth });

const mapStateToProps = state => ({
  authData: state.auth,
  user: state.auth.user,
  authzLoading: state.auth.fetching,
  authzError: state.auth.error,
  authzSuccess: state.auth.success,
  isImpersonateUserExists: state.auth.isImpersonateUserExists
});

const mapDispatchToProps = dispatch => ({
  load: () => {
    dispatch(loadUser());
  }
});

class Application extends Component {
  constructor(props) {
    super(props);
    // let the Hub module listen on Auth events
    Hub.listen('auth', this);
    this.state = {
      authState: 'loading',
      showMfa: false
    };
  }

  componentDidMount = () => {
    //Remove the impersonated flag, so that it will fallback to regular user
    localStorage.removeItem('x-impersonated-email');

    // check the current user when the App component is loaded
    setTimeout(() => {
      Auth.currentAuthenticatedUser()
        .then(async user => {
          console.log('USERS : ', user);
          this.setState({ authState: 'signedIn' });

          if (!localStorage.getItem("mfa-session-id")) {
            const mfaSessionToken = await getMfaUserToken();
            localStorage.setItem("mfa-session-id", mfaSessionToken)
          }

          const showMfa = await checkMultiFactorAuth();
          if (showMfa) this.setState({ authState: 'mfaSignIn' });
          else this.props.load();
          ReactGA.set('userId', user.attributes.email);

          if (window.location.host === "developers.byjusorders.com" && user?.attributes?.name && user?.attributes?.email) {
            datadogRum.init({
              applicationId: '2bbc6574-25b8-46a1-8303-225a00cbe866',
              clientToken: 'pubc15de2494a8008f5a785e33999e2ac19',
              site: 'datadoghq.com',
              service: 'ums',
              env: process.env.NODE_ENV,
              sampleRate: 100,
              trackInteractions: true,
              defaultPrivacyLevel: 'mask-user-input',
            });

            datadogRum.setUser({
              name: user.attributes.name,
              email: user.attributes.email,
            });

            datadogRum.startSessionReplayRecording();
            console.log("Datadog session tracking started...!!");
          }

        })
        .catch(e => {
          console.log(e);
          this.setState({ authState: 'signIn' });
        });
    }, 3000);

    /** Send Hearbeat for Active User after every 5 minutes */
    setInterval(async () => {
      await this.sendHeartbeat();
    }, 300000);
  };

  sendHeartbeat = async () => {
    const url = `/usermanagement/appuser/heartbeat`;
    const method = "POST";
    await callApi(url, method, null, null, null, true)
      .then(response => {
        if (response != null) {
          console.log(response);
          this.setState({ "heartbeat": response });
        }
      })
      .catch(error => {
        this.setState({ error: error });
        console.log(error.message);
      })
  }

  onHubCapsule = capsule => {
    // The Auth module will emit events when user signs in, signs out, etc
    const { channel, payload, source } = capsule;
    if (channel === 'auth') {
      switch (payload.event) {
        case 'signIn':
          console.log('signed in');
          this.setState({ authState: 'loading' });
          break;
        case 'signIn_failure':
          console.log('not signed in');
          this.setState({ authState: 'signIn' });
          break;
        default:
          break;
      }
    }
  };

  signOut = () => {
    Auth.signOut()
      .then(() => {
        this.setState({ authState: 'signIn' });
      })
      .catch(e => {
        console.log(e);
      });
  };

  componentWillReceiveProps(nextProps) {
    if (
      this.props.loading &&
      !nextProps.loading &&
      !nextProps.error &&
      !this.state.loaded
    ) {
      this.setState({ loaded: true });
    }
  }

  componentDidUpdate() {
    window.dispatchEvent(new Event('resize'));
  }


  isMfaVerified = (isVerified) => {
    if (isVerified) {
      this.setState({ authState: 'signedIn' });
      this.props.load();
    }
  }

  render() {
    const { authState, showMfa } = this.state;
    const { user, authzLoading, authzSuccess, authzError, authData } = this.props;

    console.log("RENDER authState :", authData);
    console.log("RENDER USER :", user);

    return (
      /**Passing history in AppProvider to be used in other components */
      <AppProvider
        value={{ history: this.props.history, user: this.props.user }}
      >
        <div className="App">
          {(authState === 'loading' || authzLoading) && <Loading />}
          {authState === 'signIn' && <OAuthButton />}
          {authState === 'mfaSignIn' && <MultiFactorAuth isVerified={this.isMfaVerified} />}
          {authState === 'signedIn' && authzSuccess && user && (
            <Router history={this.props.history} />
          )}
          {authzError && <ServerError />}
        </div>
      </AppProvider >
    );
  }
}

function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
      }}
    >
      <i className="fa fa-refresh fa-spin fa-2x" />
    </div>
  );
}

Application.propTypes = {
  load: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired
  }),
  user: PropTypes.object,
  history: PropTypes.object
};

/**Adding  AppContext to pass values to other component from here*/
const AppContext = createContext({});
export const AppProvider = AppContext.Provider;
export const AppConsumer = AppContext.Consumer;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Application);
