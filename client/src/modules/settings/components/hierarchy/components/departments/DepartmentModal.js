import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class Department extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            data: null
        }
    }

    buildForm = (data) => {
        const fields = [{
            type: "text",
            name: "name",
            label: "Name",
            required: true,
            disabled: data ? true : false
        }, {
            type: "text",
            name: "description",
            label: "Description",
            required: true
        }, {
            type: "select",
            name: "permissionTemplate",
            label: "Permission Template",
            model: "PermissionTemplate",
            displayKey: "name",
            valueKey: "formatted_name",
            isMulti: true
        }];

        return (
            <>
                <FormBuilder
                    ref="departmentForm"
                    fields={fields}
                    initialValues={data}
                    validateValues={this.validateDepartmentDetails}
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

    validateDepartmentDetails = (formValues = {}) => {
        let { name = "" } = formValues;
        let nameRegex = new RegExp(/^[a-zA-Z\s\.]+$/);
        let validationErrors = {};

        if (!nameRegex.test(name)) {
            validationErrors["name"] = `Invalid Name.`
        }

        return validationErrors;
    }

    onClickSave = () => {
        const { data } = this.state;
        const departmentForm = this.refs.departmentForm;
        const formValues = departmentForm ? departmentForm.validateFormAndGetValues() : null;

        if (formValues) {
            this.setState({ loading: true });
            const type = data ? "edit" : "add";
            const url = (type == "add") ? `/usermanagement/hierarchy/department` : `/usermanagement/hierarchy/department/${get(data, '_id')}`;
            const methpd = (type == "add") ? "POST" : "PUT";
            formValues.name = formValues.name.trim();
            formValues.description = formValues.description.trim();
            const body = {
                ...formValues,
                updatedBy: get(this.props.user, 'email', "")
            };

            try {
                callApi(url, methpd, body, null, null, true)
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

    componentWillMount = () => {
        const { data } = this.props;

        if (data) {
            this.setState({ data });
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
                heading={`${data ? "Edit" : "Create"} Department`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(Department);