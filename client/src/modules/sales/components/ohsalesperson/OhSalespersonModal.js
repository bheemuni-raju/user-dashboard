import React from 'react';
import { Button } from 'reactstrap';
import { pick, get, isEmpty } from 'lodash';
import Notify from 'react-s-alert';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class OhSalespersonCreateModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    createOhUserInUMS = () => {
        const { createUMSForm } = this.refs;
        const formValues = createUMSForm.validateFormAndGetValues();

        if (formValues) {
            const { email } = formValues;
            const payload = { email };
            this.setState({ loading: true, error: null });
            callApi(`/usermanagement/orderhiveSalesperson`, 'POST', payload, null, null, true)
                .then(response => {
                    if (response.status) {
                        Notify.success(`${email} is added successfully in OH salesperson list.`);
                        this.setState({ loading: false, error: null });
                    }
                    else {
                        Notify.success(response.error);
                        this.setState({ loading: false, error: response.error });
                    }

                    this.props.closeModal();
                })
                .catch(error => {
                    this.setState({ loading: false, error: error && error.error });
                })
        }
    }

    createUserInOH = () => {
        const { createOHForm } = this.refs;
        const formValues = createOHForm.validateFormAndGetValues();

        if (formValues) {
            const { email, tnlId, name } = formValues;
            const payload = { email, tnlId, name };
            this.setState({ loading: true, error: null });
            callApi(`/usermanagement/orderhiveSalesperson/createUserInOH`, 'POST', payload, null, null, true)
                .then(response => {
                    if (response.status) {
                        Notify.success(`${email} is created successfully in OH.`);
                        this.setState({ loading: false, error: null });
                    }
                    else {
                        Notify.success(response.error);
                        this.setState({ loading: false, error: response.error });
                    }

                    this.props.closeModal();
                })
                .catch(error => {
                    this.setState({ loading: false, error: error && error.error });
                })
        }
    }

    updateOhUserInUMS = () => {
        const { editForm } = this.refs;
        const formValues = editForm.validateFormAndGetValues();

        if (formValues) {
            const { email, ohUserId, tnlId } = formValues;
            const payload = {
                username: email,
                userId: ohUserId,
                employee_code: tnlId
            };
            this.setState({ loading: true, error: null });
            callApi(`/usermanagement/orderhiveSalesperson`, 'PUT', payload, null, null, true)
                .then(response => {
                    this.setState({ loading: false, error: null });
                    this.props.closeModal();
                    Notify.success(`${email} details are updated successfully in OH salesperson list.`)
                })
                .catch(error => {
                    this.setState({ loading: false, error });
                })
        }
    }

    validateForm = (formValues = {}) => {
        let { email = "", name = "", tnlId = "" } = formValues;
        let validEmailFormats = ["@byjus.com", "@moreideas.ae", "@ls.moreideas.ae", "@aesl.in", "@tangibleplay.com"]
        let validEmailFlag = false;
        let nameRegex = new RegExp(/^[a-zA-Z\s\.]+$/);

        let validationErrors = {};

        if (!isEmpty(name) && !nameRegex.test(name)) {
            validationErrors["name"] = `Invalid Name.`
        }

        validEmailFormats.map(emailFormat => {
            if (email.includes(emailFormat)) {
                validEmailFlag = true;
            }
        });

        if (!validEmailFlag) {
            validationErrors["email"] = `Please enter valid byjus email id`
        }

        if (!isEmpty(tnlId)) {
            let validTnlFormats = ["TNL", "tnl", "C1", "c1", "Mi", "mi"];
            let validTnlFlag = false;
            validTnlFormats.map(tnlFormat => {
                if (tnlId.includes(tnlFormat)) {
                    validTnlFlag = true;
                }
            });

            if (!validTnlFlag) {
                validationErrors["tnlId"] = `Please enter valid TNL id`
            }
        }

        return validationErrors;
    }

    buildCreateUMSForm = () => {
        const fields = [{
            type: 'email',
            name: 'email',
            label: 'Enter email id',
            required: true
        }];

        return (
            <FormBuilder
                ref="createUMSForm"
                fields={fields}
                validateValues={this.validateForm}
            />
        )
    }

    buildCreateOHForm = () => {
        const fields = [{
            type: 'email',
            name: 'email',
            label: 'Enter email Id',
            required: true
        }, {
            type: 'text',
            name: 'name',
            label: 'Enter name',
            required: true
        }, {
            type: 'text',
            name: 'tnlId',
            label: 'Enter tnl Id',
            required: true
        }];

        return (
            <FormBuilder
                ref="createOHForm"
                fields={fields}
                validateValues={this.validateForm}
            />
        )
    }

    buildEditForm = () => {
        const { ohUserData } = this.props;

        const fields = [{
            type: 'readonlytext',
            name: 'ohUserId',
            label: 'OH User Id',
            required: true
        }, {
            type: 'readonlytext',
            name: 'email',
            label: 'Email',
            required: true
        }, {
            type: 'text',
            name: 'tnlId',
            label: 'Tnl Id',
            required: true
        }];

        const { username, userId, employee_code } = ohUserData;

        return (
            <>
                <Button color="success" size="sm" onClick={() => this.syncOhUserId()} >
                    <i className="fa fa-pencil" /> Sync OH User ID
                </Button>
                <FormBuilder
                    ref="editForm"
                    fields={fields}
                    initialValues={{
                        ohUserId: userId,
                        email: username,
                        tnlId: employee_code
                    }}
                    validateValues={this.validateForm}
                />
            </>
        )
    }

    fetchModalParams = () => {
        const { ohUserData, modalType } = this.props;

        let heading = "";
        let onClick = {};
        let formMethod = {};
        if (modalType === "createOHModal") {
            heading = `Create User in OH`;
            onClick = this.createUserInOH;
            formMethod = this.buildCreateOHForm();
        }
        else if (modalType === "createUMSModal") {
            heading = `Add OH User in UMS `;
            onClick = this.createOhUserInUMS;
            formMethod = this.buildCreateUMSForm();
        }
        else if (modalType === "editModal") {
            heading = `Edit ${get(ohUserData, 'username', '') || ''}`;
            onClick = this.updateOhUserInUMS;
            formMethod = this.buildEditForm();
        }

        return { heading, onClick, formMethod };
    }

    render() {
        const { loading, error } = this.state;
        const { closeModal } = this.props;
        let { heading, onClick, formMethod } = this.fetchModalParams();

        return (
            <ModalWindow
                showModal={true}
                heading={heading}
                loading={loading}
                error={error}
                addOkCancelButtons={true}
                onClickOk={onClick}
                okText="Save"
                closeModal={closeModal}
            >
                {formMethod}
            </ModalWindow>
        );
    }

    syncOhUserId = () => {
        const { ohUserData } = this.props;
        let { username, employee_code } = ohUserData;

        if (username) {
            const payload = { email: username, currentUserId: employee_code };
            this.setState({ loading: true, error: null });
            callApi(`/usermanagement/orderhiveSalesperson/syncOhUserId`, 'POST', payload, null, null, true)
                .then(response => {
                    if (response.status) {
                        Notify.success(`UserId synced successfully.Please refresh the page`);
                        this.props.closeModal();
                        this.setState({ loading: false, error: null });
                    }
                    else {
                        Notify.success(response.error);
                        this.props.closeModal();
                        this.setState({ loading: false, error: response.error });
                    }
                })
                .catch(error => {
                    this.setState({ loading: false, error });
                })
        }
        else {
            Notify.success(`User not found on OH`);
        }
    }

}

export default OhSalespersonCreateModal;
