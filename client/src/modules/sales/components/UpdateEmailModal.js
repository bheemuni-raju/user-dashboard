import React from 'react';
import { Button } from 'reactstrap';
import { get, map, isEmpty } from 'lodash';
import { Spin, Alert } from 'antd';

import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';
import { validateEmail } from 'modules/user/utils/userUtil';

class UpdateEmailModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    getFields = () => {
        return [{
            type: 'text',
            name: 'oldEmail',
            label: `Old Email`,
            required: true,
            disabled: true,

        }, {
            type: 'text',
            name: 'newEmail',
            label: `New Email`,
            required: true
        }];
    }

    onClickUpdate = () => {
        const { closeModal, refreshGrid, user } = this.props;

        const { formBuilder } = this.refs;
        const formValues = formBuilder && formBuilder.validateFormAndGetValues();

        if (formValues) {

            let oldEmail = get(formValues, 'oldEmail').toLowerCase();
            let newEmail = get(formValues, 'newEmail', "").toLowerCase();

            const body = {
                oldEmail,
                newEmail,
                updatedBy: get(user, 'email')
            }

            this.setState({ loading: true });
            callApi(`/usermanagement/employee/updateUserEmail`, 'POST', body, null, null, true)
                .then((response) => {
                    this.setState({ loading: false });
                    closeModal();
                    refreshGrid();
                })
                .catch((error) => {
                    this.setState({ loading: false, error: error && error.message });
                })
        }
    }

    validateValues = (formValues = {}) => {
        let { oldEmail = "", newEmail = "" } = formValues;

        let validationErrors = {};
        let validEmailFlag = validateEmail(newEmail);
        if (!validEmailFlag) {
            validationErrors["newEmail"] = `Please enter valid byjus email id`
        }
        else if (oldEmail === newEmail) {
            validationErrors["newEmail"] = `Both old and new email ids cannot be same.`
        }

        return validationErrors;
    }

    render() {
        const { loading, error } = this.state;
        const oldEmail = get(this.props, 'userData.email', "");

        return (<Spin spinning={loading}>
            {error && <Alert type="error" message={error} />}
            <FormBuilder
                ref={`formBuilder`}
                fields={this.getFields("1")}
                initialValues={{
                    oldEmail: oldEmail
                }}
                validateValues={this.validateValues}
                exactFormValues={true}
                cols={1}
            />
            <div className="text-right empty-row">
                <Button type="button" color="success" onClick={this.onClickUpdate}>Update</Button>
                {'   '}
                <Button type="button" color="danger" onClick={this.props.closeModal}>Close</Button>
            </div>
        </Spin>);
    }
}

export default UpdateEmailModal