import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { validateEmail } from 'modules/user/utils/userUtil';

class AppUserModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            data: null
        }
    }

    componentWillMount = () => {
        const { data } = this.props;
        if (data) this.setState({ data });
    }

    buildForm = (data) => {
        const fields = [{
            type: "text",
            name: "email",
            label: "Application User",
            required: true,
            disabled: data ? true : false
        }, {
            type: "select",
            name: "appRoleName",
            label: "Application Role",
            model: "AppRole",
            filter: { 'appName': 'ums', 'status': 'active', 'orgFormattedName': get(data, 'orgFormattedName', '') },
            displayKey: "appRoleName",
            valueKey: "appRoleFormattedName",
            required: true
        }, {
            type: "select",
            name: "skill",
            label: "Skill",
            required: true,
            options: [
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Expert", value: "expert" }
            ],
        }];

        return (
            <>
                <FormBuilder
                    ref="formBuilder"
                    fields={fields}
                    initialValues={{
                        ...data
                    }}
                    validateValues={this.validateValues}
                    cols={1}
                />
                <div className="text-right">
                    <Button type="button" color="success" onClick={this.onClickSave}>Save</Button>
                    {'   '}
                    <Button type="button" color="danger" onClick={this.props.closeModal}>Cancel</Button>
                </div>
            </>
        )
    }

    validateValues = (formValues = {}) => {
        let { email = "" } = formValues;

        let validationErrors = {};
        let validEmailFlag = validateEmail(email);
        if (!validEmailFlag) {
            validationErrors["email"] = `Please enter valid byjus email id`
        }

        return validationErrors;
    }

    onClickSave = () => {
        const { data } = this.state;
        const formBuilder = this.refs.formBuilder;
        const formValues = formBuilder && formBuilder.validateFormAndGetValues();

        if (formValues) {
            this.setState({ loading: true });
            const type = data ? "edit" : "add";
            const url = (type == "add") ? `/usermanagement/appuser` : `/usermanagement/appuser/${get(data, 'email')}`;
            const method = (type == "add") ? "POST" : "PUT";
            const body = {
                ...formValues,
                appName: 'ums'
            };

            if (type == "add") {
                body["createdBy"] = get(this.props.user, 'email', "");
            } else {
                body["updatedBy"] = get(this.props.user, 'email', "")
            }

            try {
                callApi(url, method, body, null, null, true)
                    .then(response => {
                        this.props.refreshGrid();
                        this.props.closeModal();
                    })
                    .catch(error => {
                        this.setState({ loading: false, error });
                    })
            } catch (error) {
                this.setState({ loading: false, error });
            }
        }
    }

    render() {
        const { showModal, data, loading, error } = this.state;
        return (
            <ModalWindow
                loading={loading}
                error={error}
                showModal={showModal}
                closeModal={this.props.closeModal}
                heading={`${data ? "Edit" : "Create"} Application User`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(AppUserModal);