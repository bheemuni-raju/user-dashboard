import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import Notify from "react-s-alert";
import { get, isEmpty, startCase } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const SendSmsModal = (props) => {

    const [showModal, setShowModal] = useState(true);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const formRef = useRef();

    useEffect(() => {
        const { data } = props;
        if (data) setData(data);
    }, [data])

    const buildForm = (data) => {
        let { smsTemplateData = {} } = props;
        let { placeholders = [], activeProviders = [], senderIds = [] } = smsTemplateData;

        let providerOptions = [];
        activeProviders.map(provider => {
            providerOptions.push({ label: startCase(provider), value: provider });
        })

        let senderOptions = [];
        senderIds.map(sender => {
            senderOptions.push({ label: sender, value: sender });
        })

        const fields = [{
            type: 'text',
            name: 'phone',
            label: 'Phone',
            required: true
        }, {
            type: 'select',
            name: 'provider',
            label: 'Provider',
            required: true,
            options: providerOptions
        }, {
            type: 'select',
            name: 'senderId',
            label: 'Sender Id',
            required: true,
            options: senderOptions
        }];

        let uniquePlaceholders = placeholders.filter((i, idx) => placeholders[idx - 1] !== i);
        uniquePlaceholders.map((placeholder) => {
            fields.push({
                type: 'text',
                name: placeholder,
                label: placeholder,
                required: true
            })
        });

        return (
            <>
                <FormBuilder
                    ref={formRef}
                    fields={fields}
                    cols={2}
                    validateValues={validateValues}
                />
            </>
        )
    }

    const validateValues = (formValues = {}) => {
        let { phone = "" } = formValues;
        let phoneRegex = new RegExp(/^\d{10}$/);
        let validationErrors = {};

        if (!isEmpty(phone) && !phoneRegex.test(phone)) {
            validationErrors["phone"] = `Enter 10 digit valid Mobile No`
        }

        return validationErrors;
    }


    const onClickSend = () => {
        const formValues = (formRef && formRef.current.validateFormAndGetValues());
        let { smsTemplateData } = props;
        let { content } = smsTemplateData;

        const formattedContent = content.replace(/{\w+}/g, placeholder =>
            formValues[placeholder.substring(1, placeholder.length - 1)] || placeholder
        );

        if (formValues) {
            setLoading(true);
            const url = `/usermanagement/smstransactions/sendSms`;
            const method = "POST";
            const body = {
                ...formValues,
                appName: "ums",
                templateId: get(smsTemplateData, "templateId", ""),
                content: formattedContent
            };

            try {
                callApi(url, method, body, null, null, true)
                    .then(response => {
                        if (get(response, 'smsResponse.status', '') === 'success') {
                            Notify.success(`Sms Sent Successfully`);
                        }
                        else {
                            let error = get(response, 'smsResponse.error', '');
                            Notify.error(`Sms Sending Failed ` + error);
                        }
                        props.refreshGrid();
                        props.closeModal();
                    })
                    .catch(error => {
                        setLoading(false);
                        setError(error);
                    })
            } catch (error) {
                setLoading(false);
                setError(error);
            }
        }
    }

    return (
        <ModalWindow
            loading={loading}
            error={error}
            showModal={showModal}
            onClickOk={onClickSend}
            okText={`Send`}
            cancelText={`Cancel`}
            addOkCancelButtons={true}
            closeModal={props.closeModal}
            heading={`Send SMS`}
            size={`md`}
        >
            {buildForm(data)}
        </ModalWindow>
    )
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(SendSmsModal);