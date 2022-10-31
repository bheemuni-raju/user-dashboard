import React from 'react';
import { Button } from 'reactstrap';
import { get, map, isEmpty } from 'lodash';
import { Spin, Alert } from 'antd';

import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

class ContactDetailForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    getFields = () => {
        return [{
            type: 'number',
            name: 'contactNo1',
            label: `Contact No 1`,
            required: true
        }, {
            type: 'number',
            name: 'contactNo2',
            label: `Contact No 2`,
            required: false
        }];
    }

    onClickUpdate = () => {
        const { userData, closeModal, refreshGrid } = this.props;
        const existingContactDetails = get(userData, 'contactDetails');
        const existingContacts = map(existingContactDetails, 'contactNo');
        const { formBuilder } = this.refs;
        const formValues = formBuilder && formBuilder.validateFormAndGetValues();

        if (formValues) {
            let contactDetails = [{
                contactNo: get(formValues, 'contactNo1')
            }];

            if (formValues.contactNo2) {
                contactDetails.push({
                    contactNo: get(formValues, 'contactNo2')
                });
            }

            //const formattedContactDetails = contactDetails.filter((contact) => !existingContacts.includes(contact && contact.contactNo))

            const body = {
                action: "SAVE_CONTACT_DETAILS",
                contactDetails: contactDetails,
                email: get(userData, 'email')
            }


            if (!isEmpty(contactDetails)) {
                this.setState({ loading: true });
                callApi(`/usermanagement/employee/updateContactDetails`, 'POST', body, null, null, true)
                    .then((response) => {
                        this.setState({ loading: false });
                        closeModal();
                        refreshGrid();
                    })
                    .catch((error) => {
                        this.setState({ loading: false, error: error && error.message });
                    })
            }
            else {
                this.setState({ error: 'Contacts are already present.' })
                //closeModal();
            }
        }
    }

    validateValues = (formValues = {}) => {
        let { contactNo1 = "", contactNo2 } = formValues;
        let contactRegex = new RegExp(/^\d{10}$/);
        let validationErrors = {};

        if (!isEmpty(contactNo1) && !contactRegex.test(contactNo1)) {
            validationErrors["contactNo1"] = `Enter 10 digit valid Mobile No`
        }
        if (!isEmpty(contactNo2) && !contactRegex.test(contactNo2)) {
            validationErrors["contactNo2"] = `Enter 10 digit valid Mobile No`
        }

        if (contactNo1 == contactNo2) {
            validationErrors["contactNo2"] = `Duplicate Contact. Please enter different number to proceed.`
        }

        return validationErrors;
    }

    render() {
        const { loading, error } = this.state;
        const contactDetails = get(this.props, 'userData.contactDetails', []);

        return (<Spin spinning={loading}>
            {error && <Alert type="error" message={error} />}
            <FormBuilder
                ref={`formBuilder`}
                fields={this.getFields("1")}
                initialValues={{
                    contactNo1: contactDetails && contactDetails[0] && contactDetails[0].contactNo,
                    contactNo2: contactDetails && contactDetails[1] && contactDetails[1].contactNo
                }}
                validateValues={this.validateValues}
                exactFormValues={true}
                cols={1}
            />
            <div className="text-right empty-row">
                <Button type="button" color="success" onClick={this.onClickUpdate}>Update</Button>
                {'   '}
                <Button type="button" color="danger" onClick={this.props.closeModal}>Close</Button>
            </div>
        </Spin>);
    }
}

export default ContactDetailForm