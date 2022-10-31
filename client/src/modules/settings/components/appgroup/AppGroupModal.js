import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class AppGroupModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            loading: false,
            error: null
        }
    }

    buildForm = () => {
        const { appGroupData, user } = this.props;
        const fields = [{
            type: 'text',
            name: 'appGroupName',
            label: 'Name',
            required: true,
            disabled: isEmpty(appGroupData) ? false : true,
        }, {
            type: 'text',
            name: 'description',
            label: 'Description',
            required: true
        }, {
            type: 'select',
            isMulti: true,
            name: 'appGroupUsers',
            label: 'Group Users',
            model: 'AppUser',
            filter: { 'appName': 'ums', 'status': 'active', orgFormattedName: get(user, "orgFormattedName", "") },
            displayKey: 'email',
            valueKey: 'email'
        }];

        const initialValues = appGroupData ? appGroupData : {}

        return (
            <>
                <FormBuilder
                    ref="createAppGroupForm"
                    fields={fields}
                    initialValues={initialValues}
                />
            </>
        )
    }

    onClickSave = () => {
        const { appGroupData, actionType } = this.props;
        const createAppGroupForm = this.refs.createAppGroupForm;
        const formValues = createAppGroupForm ? createAppGroupForm.validateFormAndGetValues() : null;

        if (formValues) {
            this.setState({ loading: true });
            const body = {
                ...formValues,
                appName: "ums"
            };

            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/appgroup` : `/usermanagement/appgroup/${get(appGroupData, 'formattedName')}`;
                const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";

                body[userKey] = get(this.props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        this.props.refreshGrid();
                        this.props.closeModal("save");
                    })
                    .catch(error => {
                        this.setState({ loading: false, error });
                    })
            } catch (error) {
                this.setState({ loading: false, error });
            }
        }
    }

    render = () => {
        const { loading, error, showModal } = this.state;
        const { appGroupData } = this.props;

        return (
            <ModalWindow
                heading={isEmpty(appGroupData) ? "Create Group" : `Group : ${get(appGroupData, 'name', '')}`}
                showModal={showModal}
                closeModal={this.props.closeModal}
                loading={loading}
                error={error}
            >
                {this.buildForm()}
                <div className="text-right">
                    <Button type="button" color="success" onClick={this.onClickSave}>Save</Button>
                    {'   '}
                    <Button type="button" color="danger" onClick={this.props.closeModal}>Close</Button>
                </div>
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(AppGroupModal);