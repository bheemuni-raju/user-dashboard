import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const AssociateSenderModal = (props) => {
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
        let { smsTemplateData } = props;

        const fields = [{
            type: "select",
            name: "senderIds",
            label: "Sender Ids",
            required: true,
            isMulti: true,
            options: [
                { label: "AAKBYJ", value: "AAKBYJ" },
                { label: "BYJUID", value: "BYJUID" },
                { label: "BYJURC", value: "BYJURC" },
                { label: "BYJUSA", value: "BYJUSA" },
                { label: "TOINAC", value: "TOINAC" },
                { label: "ATLCBH", value: "ATLCBH" },
                { label: "BYJUSL", value: "BYJUSL" },
                { label: "INFSTU", value: "INFSTU" },
                { label: "RCDSSC", value: "RCDSSC" },
                { label: "TUTORV", value: "TUTORV" },
                { label: "BYJUGS", value: "BYJUGS" },
                { label: "BYJUIS", value: "BYJUIS" },
                { label: "BYJUPV", value: "BYJUPV" },
                { label: "BYJUQZ", value: "BYJUQZ" },
                { label: "BYJUSC", value: "BYJUSC" },
                { label: "FINBJC", value: "FINBJC" },
                { label: "FINBJS", value: "FINBJS" },
                { label: "TLPLMS", value: "TLPLMS" },
                { label: "332244", value: "332244" },
                { label: "325445", value: "325445" },
                { label: "DSSLBU", value: "DSSLBU" },
                { label: "DSSLBJ", value: "DSSLBJ" },
                { label: "DSSLBY", value: "DSSLBY" }
            ]
        }];

        return (
            <>
                <FormBuilder
                    ref={formRef}
                    fields={fields}
                    initialValues={{
                        senderIds: !isEmpty(data) ? get(data, "senderIds", []) : get(smsTemplateData, "senderIds", [])
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
            const url = `/usermanagement/smstemplate/associateSender`;
            const method = "PUT";
            const body = {
                ...formValues,
                templateId: get(smsTemplateData, "templateId", ""),
                updatedBy: get(props.user, 'email', ""),
                updatedAt: new Date()
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
            closeModal={props.closeModal}
            onClickOk={onClickSave}
            okText={`Save`}
            cancelText={`Close`}
            addOkCancelButtons={true}
            heading={`Associate Sender Ids`}
            size={`md`}
        >
            {buildForm(data)}
        </ModalWindow>
    )

}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(AssociateSenderModal);