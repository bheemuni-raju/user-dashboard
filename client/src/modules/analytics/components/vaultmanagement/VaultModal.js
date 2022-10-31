import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const VaultModal = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const refs = useRef({ current: "createVaultForm" });
    const { vaultData, user } = props;

    const buildForm = () => {
        const fields = [{
            type: 'text',
            name: 'vaultUuid',
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

        const initialValues = props.actionType === "UPDATE" ? vaultData : {}

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
        const { vaultData, actionType } = props;
        const createVaultForm = refs.current.current;
        const formValues = createVaultForm ? createVaultForm.validateFormAndGetValues() : null;

        if (formValues) {
            setLoading(true);
            const body = {
                ...formValues
            };
            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/vault/vaultmanagement/create` : `/usermanagement/vault/vaultmanagement/update`;
                const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";
                if (actionType === "UPDATE") {
                    body.id = vaultData.id;
                }
                body[userKey] = get(props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        props.closeModal("save");
                        props.refreshGrid();
                    })
                    .catch(error => {
                        if (error.status == 403) {
                            setError(error.errorMessage);
                        }
                        setLoading(false);

                    })
            } catch (error) {
                setLoading(false);

            }
        }
    }
    return (
        <ModalWindow
            heading={isEmpty(vaultData) ? "Create Vault" : `Name : ${vaultData.vaultUuid}`}
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
export default connect(mapStateToProps)(VaultModal);
