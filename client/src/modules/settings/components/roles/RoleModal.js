import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class RoleModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            data: null,
            type: null
        }
    }

    handleOnChange = (value, name) => {
        this.setState({ [name]: value });
    }

    buildForm = (data, subDepartmentData) => {
        let { department = "", type: roleType = "" } = this.state;
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
            //disabled: data ? true : false,
            required: true
        }, {
            type: "select",
            name: "type",
            label: "Type",
            options: [{
                label: "Hierarchy", value: "HIERARCHY"
            }, {
                label: "Application", value: "MISCELLANEOUS"
            }],
            disabled: data ? true : false,
            onChange: this.handleOnChange,
            required: true
        }, (roleType == "HIERARCHY" || get(data, 'type') == "HIERARCHY") ? {
            type: "number",
            name: "level",
            label: "Level",
            required: true,
            disabled: data ? true : false
        } : null, {
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
                    ref="roleForm"
                    fields={fields}
                    initialValues={
                        {
                            ...data,
                            department: departmentFormattedName,
                            subDepartment: get(data, 'subDepartmentFormattedName', '')
                        }}
                    validateValues={this.validateVerticalDetails}
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

    onClickSave = () => {
        const { data } = this.state;
        const roleForm = this.refs.roleForm;
        const formValues = roleForm ? roleForm.validateFormAndGetValues() : null;

        if (formValues) {
            this.setState({ loading: true });
            const type = data ? "edit" : "add";
            const url = (type == "add") ? `/usermanagement/hierarchy/role` : `/usermanagement/hierarchy/role/${get(data, '_id')}`;
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
        const { data, subDepartmentData } = this.props;

        if (data || subDepartmentData) {
            this.setState({ data, subDepartmentData });
        }
    }

    render() {
        const { showModal, data, subDepartmentData, loading, error } = this.state;
        return (
            <ModalWindow
                loading={loading}
                error={error}
                showModal={showModal}
                closeModal={this.props.closeModal}
                heading={`${data ? "Edit" : "Add"} Role`}
            >
                {this.buildForm(data, subDepartmentData)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(RoleModal);