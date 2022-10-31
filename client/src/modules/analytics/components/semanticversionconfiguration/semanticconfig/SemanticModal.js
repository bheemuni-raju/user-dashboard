import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';
import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class Semantic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            data: null
        }
    }

    handleOnChange = (selectedValue, name) => {
        this.setState({ [name]: selectedValue });
    }

    validateForm = (formValues = {}) => {
        let { dns = "", repository_path="", env_path="" } = formValues;
        let domainRegex = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/);
        let whiteSpaceRegex = new RegExp(/^\s+$/);
        let validationErrors = {};

        if (!domainRegex.test(dns)) {
            validationErrors["dns"] = `Invalid Domain Name.`
        }

        if (whiteSpaceRegex.test(repository_path)) {
            validationErrors["repository_path"] = `Enter valid Repository Path`
        }

        if (whiteSpaceRegex.test(env_path)) {
            validationErrors["env_path"] = `Enter valid Environment Path`
        }

        if (whiteSpaceRegex.test(dns)) {
            validationErrors["dns"] = `Enter valid Domain`
        }

        return validationErrors;
    }

    buildForm = (data) => {
   
        const fields = [{
            type: "select",
            name: "app_id",
            label: "Application",
            model: "Application",
            displayKey: "name",
            valueKey: "id",
            required: true,
            dbType: 'pg'
        },
        {
            type: "select",
            name: "application_type_id",
            label: "Application Type",
            model: "ApplicationType",
            displayKey: "formatted_name",
            valueKey: "id",
            required: true,
            dbType: 'pg'
        },
        {
            type: "select",
            name: "environment_id",
            label: "Environment",
            model: "Environment",
            displayKey: "formatted_name",
            valueKey: "id",
            required: true,
            dbType: 'pg'
        },
        {
            type: "text",
            name: "repository_path",
            label: "Repository Name",
            required: true
        }, {
            type: "text",
            name: "env_path",
            label: "Environment Path",
            required: true
        }, {
            type: "text",
            name: "dns",
            label: "Domain",
            required: true
        }];

        const initialValues = !isEmpty(data) ? data : {};

        return (
            <>
                <FormBuilder
                    ref="semanticForm"
                    fields={fields}
                    initialValues={initialValues}
                    validateValues={this.validateForm}
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
        const semanticForm = this.refs.semanticForm;
        const formValues = semanticForm ? semanticForm.validateFormAndGetValues() : null;

        if (formValues) {
            this.setState({ loading: true });
            const type = data ? "edit" : "add";
            const url = (type == "add") ? `/usermanagement/semantic/create` : `/usermanagement/semantic/create/${data.id}`;
            const method = (type == "add") ? "POST" : "PUT";
            
            const body = {
                ...formValues
            };
            
            try {
                const userKey = (type == "add")  ? "createdBy" : "updatedBy";
                body[userKey] = get(this.props.user, 'email', "");
                console.log('body ', body)
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
                heading={`${data ? "Edit" : "Create"} Semantic Configuration`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(Semantic);