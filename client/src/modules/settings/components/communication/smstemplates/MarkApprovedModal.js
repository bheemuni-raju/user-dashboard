import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const MarkApprovedModal = (props) => {
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
        let { smsTemplateData = {}, user } = props;

        const fields = [{
            type: 'text',
            name: 'dltTemplateId',
            label: 'DLT Template Id',
            required: true
        }, {
            type: "select",
            isMulti: true,
            name: "activeProviders",
            label: "Providers",
            model: 'SmsProvider',
            required: true,
            filter: { 'appName': 'ums', 'status': 'active', orgFormattedName: get(user, "orgFormattedName", "") },
            displayKey: 'name',
            valueKey: 'formattedName'
        }];

        return (
            <>
                <FormBuilder
                    ref={formRef}
                    fields={fields}
                    initialValues={{
                        dltTemplateId: !isEmpty(data) ? get(data, "dltTemplateId", "") : get(smsTemplateData, "dltTemplateId", "")
                    }}
                    cols={1}
                />
            </>
        )
    }

    const onClickSave = () => {
        const formValues = (formRef && formRef.current.validateFormAndGetValues());
        let { smsTemplateData } = props;

        if (formValues) {
            setLoading(true);
            const url = `/usermanagement/smstemplate/markApproved`;
            const method = "PUT";
            const body = {
                ...formValues,
                templateId: get(smsTemplateData, "templateId", "")
            };

            try {
                callApi(url, method, body, null, null, true)
                    .then(response => {
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
            onClickOk={onClickSave}
            okText={`Save`}
            cancelText={`Close`}
            addOkCancelButtons={true}
            closeModal={props.closeModal}
            heading={`Mark Approved`}
            size={`md`}
        >
            {buildForm(data)}
        </ModalWindow>
    )
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(MarkApprovedModal);