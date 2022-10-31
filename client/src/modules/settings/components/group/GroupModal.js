import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { apps, modules } from 'lib/appsAndModules';

class GroupModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            loading: false,
            error: null
        }
    }

    buildForm = () => {
        const { groupData } = this.props;
        const fields = [{
            type: 'text',
            name: 'name',
            label: 'Name',
            required: true,
            disabled: isEmpty(groupData) ? false : true,
        }, {
            type: 'text',
            name: 'description',
            label: 'Description',
            required: true
        }, {
            type: 'select',
            isMulti: true,
            name: 'users',
            label: 'Members',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email'
        }, {
            type: "select",
            name: "appCategory",
            required: true,
            label: "App Category",
            options: apps
        }, {
            type: "select",
            name: "moduleCategory",
            required: true,
            label: "Module Category",
            options: modules
        }, {
            type: 'select',
            isMulti: true,
            name: 'ownerPermissionTemplate',
            label: 'Group Owner Permission',
            model: 'PermissionTemplate',
            displayKey: 'name',
            valueKey: 'formatted_name',
            required: false
        }];

        const initialValues = groupData ? groupData : {}

        return (
            <>
                <FormBuilder
                    ref="createGroupForm"
                    fields={fields}
                    initialValues={initialValues}
                />
            </>
        )
    }

    onClickSave = () => {
        const { groupData, actionType } = this.props;
        const createGroupForm = this.refs.createGroupForm;
        const formValues = createGroupForm ? createGroupForm.validateFormAndGetValues() : null;

        if (formValues) {
            this.setState({ loading: true });
            const body = {
                ...formValues
            };

            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/group` : `/usermanagement/group/${get(groupData, 'formattedName')}`;
                const userKey = actionType === "UPDATE" ? "createdBy" : "updatedBy";

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
        const { groupData } = this.props;

        return (
            <ModalWindow
                heading={isEmpty(groupData) ? "Create Group" : `Group : ${get(groupData, 'name', '')}`}
                showModal={showModal}
                closeModal={this.props.closeModal}
                loading={loading}
                error={error}
            >
                {/*<Row>
                    <Col md={6}>
                        <img src={GroupImg} alt="Group" width="100%" />
                    </Col>
                    <Col md={6}>
                        {this.buildForm()}
                    </Col>
                </Row>*/}
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

export default connect(mapStateToProps)(GroupModal);