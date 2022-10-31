import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class CityModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            data: null
        }
    }

    componentWillMount = () => {
        const { data } = this.props;
        if (data) this.setState({ data });
    }

    buildForm = (data) => {
        let { country = "" } = this.state;
        let countryId = !isEmpty(country) ? country : get(data, "countryId", "");
        const fields = [{
            type: "text",
            name: "name",
            label: "City",
            required: true,
            disabled: data ? true : false
        }, {
            type: "select",
            name: "country",
            label: "Country",
            model: "Country",
            displayKey: "name",
            valueKey: "id",
            required: true,
            dbType: "pg"
        }];

        return (
            <>
                <FormBuilder
                    ref="formBuilder"
                    fields={fields}
                    initialValues={
                        {
                            ...data,
                            country: countryId
                        }
                    }
                    validateValues={this.validateCityDetails}
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

    validateCityDetails = (formValues = {}) => {
        let { name = "" } = formValues;
        let cityRegex = new RegExp(/^[a-zA-Z\s\.]+$/);
        let validationErrors = {};

        if (!cityRegex.test(name)) {
            validationErrors["name"] = `Invalid City Name.`
        }

        return validationErrors;
    }

    onClickSave = () => {
        const { data } = this.state;
        const formBuilder = this.refs.formBuilder;
        const formValues = formBuilder && formBuilder.validateFormAndGetValues();

        if (formValues) {
            this.setState({ loading: true });
            const type = data ? "edit" : "add";
            const url = (type == "add") ? `/usermanagement/hierarchy-beta/city` : `/usermanagement/hierarchy-beta/city/${get(data, 'id')}`;
            const methpd = (type == "add") ? "POST" : "PUT";
            formValues.name = formValues.name.trim();
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

    render() {
        const { showModal, data, loading, error } = this.state;
        return (
            <ModalWindow
                loading={loading}
                error={error}
                showModal={showModal}
                closeModal={this.props.closeModal}
                heading={`${data ? "Edit" : "Create"} City`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(CityModal);