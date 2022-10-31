import React, { useState, useRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, ModalFooter } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const PlaceholderModal = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { placeholderData = {} } = props;
    const formRef = useRef();

    const buildForm = () => {
        const { placeholderData = {}, user } = props;
        const fields = [{
            type: 'text',
            name: 'name',
            label: 'Placeholder Name',
            required: true,
            disabled: isEmpty(placeholderData) ? false : true,
        }];

        return (
            <>
                <FormBuilder
                    ref={formRef}
                    fields={fields}
                    initialValues={{
                        ...placeholderData,
                    }}
                />
            </>
        )
    }

    const onClickSave = () => {
        const { placeholderData = {}, actionType } = props;
        const formValues = (formRef && formRef.current.validateFormAndGetValues());

        if (formValues) {
            setLoading(true);
            const body = {
                ...formValues,
                appName: "ums"
            };

            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/placeholder` : `/usermanagement/placeholder/${get(placeholderData, '_id')}`;
                const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";

                body[userKey] = get(props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        props.refreshGrid();
                        props.closeModal("save");
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
            heading={isEmpty(placeholderData) ? "Create Template Placeholder" : `Template Placeholder : ${get(placeholderData, 'name', '')}`}
            showModal={showModal}
            closeModal={props.closeModal}
            onClickOk={onClickSave}
            okText={`Save`}
            cancelText={`Close`}
            addOkCancelButtons={true}
            loading={loading}
            error={error}
            size={`md`}
        >
            {buildForm()}
        </ModalWindow >
    )
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(PlaceholderModal);