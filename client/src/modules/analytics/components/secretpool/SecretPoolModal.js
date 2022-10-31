import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const SecretPoolModal = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const refs = useRef({ current: "createSecretForm" });
    const { secretPoolData, user } = props;

    const buildForm = () => {
        const fields = [{
            type: 'text',
            name: 'poolUuid',
            label: 'Name',
            required: true
        },
        {
            type: "select",
            name: "applicationType",
            label: "Application Type",
            model: "ApplicationType",
            displayKey: "formatted_name",
            valueKey: "id",
            required: true,
            dbType: 'pg'
        },
        {
            type: "select",
            name: "environment",
            label: "Environment",
            model: "Environment",
            displayKey: "formatted_name",
            valueKey: "id",
            required: true,
            dbType: 'pg'
        },
        {
            type: 'text',
            name: 'description',
            label: 'Description',
            required: true
        }
        ];

        const initialValues = props.actionType === "UPDATE" ? secretPoolData : {}

        return (
            <>
                <FormBuilder
                    ref={refs.current}
                    fields={fields}
                    initialValues={initialValues}
                />
            </>
        )
    }

    const onClickSave = () => {
        setError(null);
        const { secretPoolData, actionType } = props;
        const createSecretPoolForm = refs.current.current;
        const formValues = createSecretPoolForm ? createSecretPoolForm.validateFormAndGetValues() : null;

        if (formValues) {
            setError(null);
            setLoading(true);
            const body = {
                ...formValues
            };

            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/vault/secretpool/create` : `/usermanagement/vault/secretpool/update`;
                const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";

                body[userKey] = get(props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        props.refreshGrid();
                        props.closeModal("save");
                    })
                    .catch(error => {
                        if (error.status == 403) {
                            setError(error.errorMessage);
                        }
                        setLoading(false);

                    })
            } catch (error) {
                // setState({ loading: false, error });
                setLoading(false);

            }
        }
    }
    return (
        <ModalWindow
            heading={isEmpty(secretPoolData) ? "Create Sub Vault" : `Name : ${secretPoolData.poolUuid}`}
            showModal={showModal}
            closeModal={props.closeModal}
            loading={loading}
            error={error}
        >
            {buildForm()}
            <div className="text-right">
                <Button type="button" color="success" onClick={onClickSave}>Save</Button>
                {'   '}
                <Button type="button" color="danger" onClick={props.closeModal}>Close</Button>
            </div>
        </ModalWindow>
    )

}
const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});
export default connect(mapStateToProps)(SecretPoolModal);
