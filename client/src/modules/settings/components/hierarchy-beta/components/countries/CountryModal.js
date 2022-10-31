import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get } from 'lodash';
import moment from 'moment-timezone';
import cc from 'currency-codes';
import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

class CountryModal extends Component {
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
        let timezones = moment.tz.names();
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
            name: "currency",
            label: "Currency",
            options: cc.codes(),
            required: true
        }, {
            type: "select",
            name: "timezone",
            label: "Timezone",
            options: timezones,
            required: true
        }];

        return (
            <>
                <FormBuilder
                    ref="formBuilder"
                    fields={fields}
                    initialValues={data}
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
            const url = (type == "add") ? `/usermanagement/hierarchy-beta/country` : `/usermanagement/hierarchy-beta/country/${get(data, 'id')}`;
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
                heading={`${data ? "Edit" : "Create"} Country`}
            >
                {this.buildForm(data)}
            </ModalWindow>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(CountryModal);