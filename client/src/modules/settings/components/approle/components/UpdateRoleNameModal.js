import React from 'react';
import { Button } from 'reactstrap';
import { get, map, isEmpty } from 'lodash';
import { Spin, Alert } from 'antd';

import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

class UpdateRoleNameModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    getFields = () => {
        return [{
            type: 'text',
            name: 'oldRoleName',
            label: `Current Role Name`,
            required: false,
            disabled: true,

        }, {
            type: 'text',
            name: 'newRoleName',
            label: `New Role Name`,
            required: true
        }];
    }   

    onClickUpdate = () => {
        const { closeModal, refreshGrid, user } = this.props;

        const { formBuilder } = this.refs;
        const formValues = formBuilder && formBuilder.validateFormAndGetValues();

        if (formValues) {

            let oldRoleName = get(formValues, 'oldRoleName');
            let newRoleName = get(formValues, 'newRoleName', "");

            const body = {
                oldRoleName,
                newRoleName,
                updatedBy: get(user, 'email')
            }

            this.setState({ loading: true });
            callApi(`/usermanagement/appRole/updateRoleName`, 'POST', body, null, null, true)
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
        let { oldRoleName = "", newRoleName = "" } = formValues;

        let validationErrors = {};
        if (isEmpty(newRoleName)) {
            validationErrors["newRoleName"] = `Please enter valid role name`
        }
        else if (oldRoleName === newRoleName) {
            validationErrors["newRoleName"] = `Both old and new role names cannot be same.`
        }

        return validationErrors;
    }

    render() {
        const { loading, error } = this.state;
        const oldRoleName = get(this.props, 'userData.appRoleName', "");

        return (<Spin spinning={loading}>
            {error && <Alert type="error" message={error} />}
            <FormBuilder
                ref={`formBuilder`}
                fields={this.getFields("1")}
                initialValues={{
                    oldRoleName: oldRoleName
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

export default UpdateRoleNameModal