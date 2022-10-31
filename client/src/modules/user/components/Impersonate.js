import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get } from 'lodash';

import { BoxBody } from 'components/box';
import FormBuilder from 'components/form/FormBuilder';
import { loadImpersonateUser, loadUser } from '../authReducer';
import { callApi } from 'store/middleware/api';
import { validateEmailFormat } from '../utils/userUtil';

const mapDispatchToProps = dispatch => ({
  loadImpersonateUser: (user, reactHistory) => {
    dispatch(loadImpersonateUser(user, reactHistory));
  },
  loadUser: () => {
    dispatch(loadUser());
  }
});

const mapStateToProps = state => ({
  user: state.auth.user,
  impersonateUser: state.auth.impersonateUser,
  loading: state.auth.fetching,
  error: state.auth.error,
  success: state.auth.success,
  isImpersonateUserExists: state.auth.isImpersonateUserExists
});

class Impersonate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      impersonateUser: null,
      loading: false,
      error: null
    };
  }

  componentWillMount = async () => {
    this.setState({ showModal: true });
    console.log(this.props.isImpersonateUserExists, this.props.user.email);
    if (this.props.isImpersonateUserExists) {
      // localStorage.setItem(
      //   'x-impersonated-email',
      //   get(this, 'props.user.email')
      // );
      // this.props.history.push('/');
    }
  };

  onClickImpersonate = async () => {
    const { impersonateForm } = this.refs;
    const formValues =
      (impersonateForm && impersonateForm.getFormValues()) || {};
    const { impersonateUser } = formValues;

    let validEmailFlag = validateEmailFormat(impersonateUser.toLowerCase());
    if (impersonateUser && validEmailFlag) {
      const result = await this.checkIfUserExists(impersonateUser);
      if (result) {
        await this.props.loadImpersonateUser(impersonateUser, this.props.history);
      }
    }
    else {
      this.setState({ error: 'Please enter a valid Byjus EmailId' });
    }
  };

  checkIfUserExists = async (impersonateUser) => {
    try {
      this.setState({ loading: true, error: null });
      const impersonateUrl = window.UMS_SERVERLESS_URL ? `/usermanagement/auth/profile?emailId=${impersonateUser}`: `/usermanagement/employee/getByEmail/${impersonateUser}`;
      const response = await callApi(impersonateUrl, 'GET', null, null, null, true, true);
      this.setState({ loading: false });
      if (response) {
        return response;
      }
      else {
        this.setState({ error: `${impersonateUser} doesn't exist` });
        return null;
      }
    } catch (error) {
      this.setState({ loading: false, error });
    }
  }

  onClickClose = () => {
    this.props.history.goBack();
  };

  onKeyPress = e => {
    if (e.key === 'Enter') {
      this.onClickImpersonate();
    }
  };

  render = () => {
    const { loading, error } = this.state;

    const fields = [
      {
        name: 'impersonateUser',
        label: 'Enter Impersonate User Email:',
        type: 'text',
        required: true,
        style: { width: '50%' },
        onKeyPress: this.onKeyPress
      }
    ];

    return (
      <BoxBody loading={loading} error={error}>
        <div className="card">
          <div className="card-header">Impersonate</div>
          <div className="card-body">
            <FormBuilder ref="impersonateForm" fields={fields} cols={1} />
          </div>
          <div className="card-footer text-right">
            <Button color="success" size="sm" onClick={this.onClickImpersonate}>
              Impersonate
            </Button>{' '}
            <Button color="danger" size="sm" onClick={this.onClickClose}>
              Close
            </Button>
          </div>
        </div>
      </BoxBody>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Impersonate);
