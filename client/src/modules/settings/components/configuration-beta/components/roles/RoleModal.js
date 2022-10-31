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
        let { department = "", roleType = "" } = this.state;
        let departmentId = !isEmpty(department) ? department : get(data, "departmentId", "");

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
            valueKey: "id",
            required: true,
            onChange: this.handleOnChange,
            dbType: "pg"
        }, {
            type: "select",
            label: "Sub Department",
            name: "subDepartment",
            model: "SubDepartment",
            filter: { where: { departmentId } },
            displayKey: "name",
            valueKey: "id",
            //disabled: data ? true : false,
            required: true,
            dbType: "pg"
        }, {
            type: "select",
            name: "roleType",
            label: "Type",
            options: [{
                label: "Hierarchy", value: "HIERARCHY"
            }, {
                label: "Application", value: "MISCELLANEOUS"
            }],
            disabled: data ? true : false,
            onChange: this.handleOnChange,
            required: true,
            dbType: "pg"
        }, (roleType == "HIERARCHY" || get(data, 'roleType') == "HIERARCHY") ? {
            type: "number",
            name: "level",
            label: "Level",
            required: true,
            disabled: data ? true : false
        } : null];

        return (
            <>
                <FormBuilder
                    ref="roleForm"
                    fields={fields}
                    initialValues={
                        {
                            ...data,
                            department: departmentId,
                            subDepartment: get(data, 'subdepartmentId', '')
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
            const url = (type == "add") ? `/usermanagement/hierarchy-beta/role` : `/usermanagement/hierarchy-beta/role/${get(data, 'id')}`;
            const methpd = (type == "add") ? "POST" : "PUT";
            formValues.name = formValues.name.trim();
            formValues.description = formValues.description.trim();
            const body = {
                ...formValues
            };

            if (type == "add") {
                body["createdBy"] = get(this.props.user, 'email', "")
            }
            else {
                body["updatedBy"] = get(this.props.user, 'email', "")
            }

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