import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const MarkRejectedModal = (props) => {
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

        const fields = [{
            type: 'text',
            name: 'rejectedReason',
            label: 'Rejected Reason',
            required: true
        }];

        return (
            <>
                <FormBuilder
                    ref={formRef}
                    fields={fields}
                    initialValues={{
                        rejectedReason: !isEmpty(data) ? get(data, "rejectedReason", "") : get(smsTemplateData, "rejectedReason", "")
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
            const url = `/usermanagement/smstemplate/markRejected`;
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
            heading={`Mark Rejected`}
            size={`md`}
        >
            {buildForm(data)}
        </ModalWindow>
    )
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(MarkRejectedModal);