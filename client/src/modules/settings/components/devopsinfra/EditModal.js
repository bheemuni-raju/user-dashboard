import React, { useRef, useState } from 'react';
import { startCase, concat, get, isEmpty, pick } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const EditModal = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { data = {}, closeModal, refreshGrid } = props;
    const { team, application, serviceApproverDetails, qaEmail, devopsEmail } = data;
    const servicesKeys = Object.keys(serviceApproverDetails);
    const formRef = useRef();

    const updateApproverDetails = async () => {
        const formValues = formRef.current.validateFormAndGetValues();

        if (!isEmpty(formValues)) {
            const body = {
                team, application,
                qaEmail: get(formValues, 'qaEmail'),
                devopsEmail: get(formValues, 'devopsEmail'),
                serviceApproverDetails: pick(formValues, servicesKeys)
            }
            setLoading(true);
            callApi(`/usermanagement/settings/devopsinfra/updateData`, 'POST', body, null, null, true)
                .then((reponse) => {
                    setLoading(false);
                    closeModal();
                    refreshGrid();
                })
                .catch((error) => {
                    setLoading(false);
                    setError(error.message);
                });
        }
    }

    const validateValues = (formValues) => {
        let validationErrors = {};

        Object.keys(formValues).map(key => {
            if (!formValues[key].includes('@byjus.com')) {
                validationErrors[key] = `Enter a valid byjus emailId`;
            }
        })

        return validationErrors;
    }

    const getFields = () => {
        const generalFields = [{
            type: 'text',
            name: 'qaEmail',
            required: true,
            label: 'QA Email',
            placeHolder: `Enter QA Email`,
            value: qaEmail
        }, {
            type: 'text',
            name: 'devopsEmail',
            required: true,
            label: 'Devops Email',
            placeholder: `Enter Devops Email`,
            value: devopsEmail
        }];

        const servicesFields = servicesKeys.map((key) => {
            return {
                type: 'text',
                name: key,
                required: true,
                label: startCase(key),
                placeholder: `Enter ${key}`,
                value: serviceApproverDetails[key]
            }
        });

        return concat(generalFields, servicesFields);
    }

    return (
        <ModalWindow
            heading={`${startCase(team)} - ${startCase(application)} : Details`}
            loading={loading}
            error={error}
            showModal={true}
            closeModal={closeModal}
            addOkCancelButtons={true}
            onClickOk={updateApproverDetails}
            okText="Update"
        >
            <FormBuilder
                ref={formRef}
                fields={getFields()}
                cols={2}
                validateValues={validateValues}
                initialValues={{
                    qaEmail,
                    devopsEmail,
                    ...serviceApproverDetails
                }}
            />
        </ModalWindow>
    )
}

export default EditModal;