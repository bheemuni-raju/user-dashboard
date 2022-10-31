import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class Unit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            data: null
        }
    }

    handleOnChange = (selectedValue, name) => {
        console.log("onchange: " + selectedValue);
        this.setState({ [name]: selectedValue });
    }

    buildForm = (data) => {
        let { department = "" } = this.state;
        let departmentFormattedName = !isEmpty(department) ? department : get(data, "departmentFormattedName", "");

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
            name: "department",
            label: "Department",
            model: "Department",
            displayKey: "name",
            valueKey: "formattedName",
            required: true,
            onChange: this.handleOnChange
        }, {
            type: "select",
            label: "Sub Department",
            name: "subDepartment",
            model: "SubDepartment",
            filter: { departmentFormattedName },
            displayKey: "name",
            valueKey: "formattedName",
            loadByDefault: departmentFormattedName ? true : false,
            required: true
        }
        ];

        const initialValues = !isEmpty(data) ? data : {};
        if (!isEmpty(departmentFormattedName)) {
            initialValues["department"] = departmentFormattedName
        }
        if (get(data, 'subDepartmentFormattedName')) {
            initialValues["subDepartment"] = get(data, 'subDepartmentFormattedName')
        }

        return (
            <>
                <FormBuilder
                    ref="unitForm"
                    fields={fields}
                    initialValues={initialValues}
                    validateValues={this.validateUnitDetails}
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

    validateUnitDetails = (formValues = {}) => {
        let { name = "" } = formValues;
        let nameRegex = new RegExp(/^[a-zA-Z0-9\s\.]+$/);
        let validationErrors = {};

        if (!nameRegex.test(name)) {
            validationErrors["name"] = `Invalid Name.`
        }

        return validationErrors;
    }

    onClickSave = () => {
        const { data } = this.state;
        const unitForm = this.refs.unitForm;
        const formValues = unitForm ? unitForm.validateFormAndGetValues() : null;

        if (formValues) {
            this.setState({ loading: true });
            const type = data ? "edit" : "add";
            const url = (type == "add") ? `/usermanagement/hierarchy/unit` : `/usermanagement/hierarchy/unit/${get(data, '_id')}`;
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
        if (data) this.setState({ data });
    }

    render() {
        const { showModal, data, loading, error } = this.state;
        return (
            <ModalWindow
                loading={loading}
                error={error}
                showModal={showModal}
                closeModal={this.props.closeModal}
                heading={`${data ? "Edit" : "Create"} Unit`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(Unit);