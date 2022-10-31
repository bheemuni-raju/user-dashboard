import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class SmsProviderModal extends Component {
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
            name: "name",
            label: "Sms Provider Name",
            required: true
        }];

        return (
            <>
                <FormBuilder
                    ref="formBuilder"
                    fields={fields}
                    initialValues={data}
                    validateValues={this.validateSmsProviderName}
                    cols={1}
                />
            </>
        )
    }

    validateSmsProviderName = (formValues = {}) => {
        let { name = "" } = formValues;
        let nameRegex = new RegExp(/^[a-zA-Z\s\.]+$/);
        let validationErrors = {};

        if (!nameRegex.test(name)) {
            validationErrors["name"] = `Invalid Sms Provider Name.`
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
            const url = (type == "add") ? `/usermanagement/smsprovider` : `/usermanagement/smsprovider/${get(data, '_id')}`;
            const method = (type == "add") ? "POST" : "PUT";
            formValues.name = formValues.name.trim();
            const body = {
                ...formValues,
                appName: "ums",
                updatedBy: get(this.props.user, 'email', ""),
                updatedAt: new Date()
            };

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
                onClickOk={this.onClickSave}
                okText={`Save`}
                cancelText={`Close`}
                addOkCancelButtons={true}
                heading={`${data ? "Edit" : "Create"} App Token`}
                size={`md`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(SmsProviderModal);