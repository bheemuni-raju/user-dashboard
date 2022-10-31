import React, { useRef, useState } from "react";
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const VaultRoleMappingModal = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { vaultRoleMappingdata, user } = props;
    const refs = useRef();
    const buildForm = (status) => {

        const fields = [
            {
                type: 'select',
                isMulti: true,
                name: 'appGroupId',
                label: 'User Groups',
                model: 'AppGroup',
                required: true,
                filter: {
                    'appName': 'ums', 'status': 'active', orgFormattedName: get(user, "orgFormattedName", "")
                },
                displayKey: 'appGroupName',
                valueKey: '_id'
            }];
        const appGroupId = [];
        if (props.vaultRoleMappingData) {
            for (let i = 0; i < props.vaultRoleMappingData.vaultAppGroupMapping.length; i++) {
                appGroupId.push(props.vaultRoleMappingData.vaultAppGroupMapping[i].id);
            }
            Object.assign(props.vaultRoleMappingData, { "appGroupId": appGroupId });
        }
        const initialValues = props.actionType === "UPDATE" ? props.vaultRoleMappingData : {}

        return (
            <>
                <FormBuilder
                    ref={refs}
                    fields={fields}
                    initialValues={initialValues}
                />
            </>
        )
    }
    const onClickSave = async () => {
        const { vaultRoleMappingData, actionType } = props;
        const formValues = refs && refs.current && refs.current.validateFormAndGetValues();

        if (formValues) {
            setLoading(true);
            const body = {
                ...formValues,
                vaultId: props.id
            };

            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/vault/vaultrolemapping/create` : `/usermanagement/vault/vaultrolemapping/update`;
                const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";
                body[userKey] = get(props.user, 'email', "");
                await callApi(uri, method, body, null, null, true)
                    .then(response => {
                        props.refreshGrid();
                        props.closeModal("save");
                    })
                    .catch(error => {
                        if (error.status == 403) {
                            setError(error.errorMessage);
                            setLoading(false);
                            return false;
                        }
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
            heading={isEmpty(vaultRoleMappingdata) ? "Create Vault User Group Mapping" : `Vault Role Mapping: ${get(vaultRoleMappingdata, 'id', '')
                }`}
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

export default connect(mapStateToProps)(VaultRoleMappingModal);
