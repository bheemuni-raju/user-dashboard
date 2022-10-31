import React from 'react';
import { connect } from 'react-redux';
import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { isEmpty, get } from 'lodash';

import { callApi } from 'store/middleware/api';
import Notify from 'react-s-alert';

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
})

class PicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            initialValues: {}
        }
    }

    buildForm = () => {
        let { initialValues } = this.state;
        const { picData } = this.props;

        const fields = [{
            type: 'text',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email',
            name: 'email',
            label: 'Pic Email',
            required: true,
            disabled: picData && picData.pic_email_id.toLowerCase() ? true : false
        }, {
            label: 'Pic Location',
            type: "select",
            name: "location",
            model: "City",
            filter: {},
            displayKey: "city",
            valueKey: "city",
            required: true,
            isMulti: true
        }];
        if (picData) {
            initialValues.email = picData.pic_email_id.toLowerCase();
            initialValues.location = picData.locations;
        }

        return (
            <FormBuilder
                fields={fields}
                ref="picForm"
                col={2}
                initialValues={initialValues}
            />
        );
    }

    onClickAddPic = () => {
        const { picForm } = this.refs;
        const formValues = picForm.validateFormAndGetValues();

        if (formValues) {
            let { email, tnlId, location } = formValues;
            email = !isEmpty(email) ? email.toLowerCase() : email;
            tnlId = !isEmpty(tnlId) ? tnlId.toLowerCase() : tnlId;

            const payload = { email, tnlId, location };
            try {
                this.setState({ loading: true, error: null })
                callApi('/paymentmanagement/icrpic/addPic', "POST", payload, null, null, true)
                    .then(response => {
                        Notify.success(`Pic ${email} added successfully!`);
                        this.props.closeModal();
                    })
                    .catch(error => {
                        this.setState({ loading: false, error: error });
                    })
            } catch (error) {
                this.setState({ error, loading: false });
            }
        }
    }

    onClickUpdateLocation = () => {
        const { picForm } = this.refs;
        const formValues = picForm.validateFormAndGetValues();
        const { user } = this.props;
        const { email: loggedInUser } = user;

        if (formValues) {
            const { email, location } = formValues;

            const payload = { email, location, loggedInUser };
            try {
                this.setState({ loading: true, error: null })
                callApi('/paymentmanagement/icrpic/updateLocation', "POST", payload, null, null, true)
                    .then(response => {
                        Notify.success(`Pic ${email} location updated successfully!`);
                        this.setState({ loading: false });
                        this.props.closeModal();
                    })
                    .catch(error => {
                        this.setState({ loading: false, error: error });
                    })
            } catch (error) {
                this.setState({ error, loading: false });
            }
        }
    }

    render() {
        const { loading, error } = this.state;
        const { updatedLocation } = this.props
        return (
            <ModalWindow
                showModal={true}
                loading={loading}
                error={error}
                closeModal={this.props.closeModal}
                heading="Add Pic"
                addOkCancelButtons={true}
                okText="Save"
                onClickOk={updatedLocation ? this.onClickUpdateLocation : this.onClickAddPic}
            >
                {this.buildForm()}
            </ModalWindow>
        );
    }
}


export default connect(mapStateToProps)(PicModal);
