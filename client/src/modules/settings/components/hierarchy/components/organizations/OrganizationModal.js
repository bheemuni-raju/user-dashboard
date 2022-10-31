import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';
import moment from 'moment-timezone';
import cc from 'currency-codes';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class Organization extends Component {
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

    validateOrganizationDetails = (formValues = {}) => {
        let { orgName = "" } = formValues;
        let nameRegex = new RegExp(/^[a-zA-Z\s\.]+$/);
        let validationErrors = {};

        if (!nameRegex.test(orgName)) {
            validationErrors["orgName"] = `Invalid Name.`
        }

        return validationErrors;
    }

    buildForm = (data) => {
        let timezones = moment.tz.names();

        const fields = [{
            type: "text",
            name: "orgName",
            label: "Name",
            required: true,
            disabled: data ? true : false
        }, {
            type: "text",
            name: "fiscalYearStartMonth",
            label: "Fiscal Year Start Month"
        }, {
            type: "select",
            name: "currencyCode",
            label: "Currency Code",
            options: cc.codes()
        }, {
            type: "select",
            name: "timeZone",
            label: "Timezone",
            options: timezones
        }, {
            type: "text",
            name: "dateFormat",
            label: "Date Format"
        }, {
            type: "text",
            name: "languageCode",
            label: "Language Code"
        }, {
            type: "text",
            name: "industryType",
            label: "Industry Type"
        }, {
            type: "text",
            name: "industrySize",
            label: "Industry Size"
        }, {
            type: "text",
            name: "portalName",
            label: "Portal Name"
        }, {
            type: "text",
            name: "orgAddress",
            label: "Organization Address"
        }, {
            type: "text",
            name: "remitToAddress",
            label: "Remit to Address"
        }, {
            type: "text",
            name: "streetAddress1",
            label: "Street Address 1"
        }, {
            type: "text",
            name: "streetAddress2",
            label: "Street Address 2"
        }, {
            type: "text",
            name: "city",
            label: "City"
        }, {
            type: "text",
            name: "state",
            label: "State"
        }, {
            type: "text",
            name: "country",
            label: "Country"
        }, {
            type: "text",
            name: "zip",
            label: "Zip Code"
        }];

        return (
            <>
                <FormBuilder
                    ref="organizationForm"
                    fields={fields}
                    initialValues={{
                        ...data,
                        "streetAddress1": get(data, "address.streetAddress1", ""),
                        "streetAddress2": get(data, "address.streetAddress2", ""),
                        "city": get(data, "address.city", ""),
                        "state": get(data, "address.state", ""),
                        "country": get(data, "address.country", ""),
                        "zip": get(data, "address.zip", "")
                    }}
                    validateValues={this.validateOrganizationDetails}
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
        const organizationForm = this.refs.organizationForm;
        const formValues = organizationForm ? organizationForm.validateFormAndGetValues() : null;

        if (formValues) {
            this.setState({ loading: true });
            const type = data ? "edit" : "add";
            const url = (type == "add") ? `/usermanagement/organization` : `/usermanagement/organization/${get(data, '_id')}`;
            const method = (type == "add") ? "POST" : "PUT";
            formValues.orgName = formValues.orgName.trim();
            let address = {
                streetAddress1: get(formValues, "streetAddress1", ""),
                streetAddress2: get(formValues, "streetAddress2", ""),
                city: get(formValues, "city", ""),
                state: get(formValues, "state", ""),
                country: get(formValues, "country", ""),
                zip: get(formValues, "zip", "")
            };

            const body = {
                ...formValues,
                address: address,
                updatedBy: get(this.props.user, 'email', "")
            };

            try {
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
                heading={`${data ? "Edit" : "Create"} Organization`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(Organization);