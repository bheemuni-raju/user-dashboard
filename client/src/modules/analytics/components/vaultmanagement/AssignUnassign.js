import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const AssignUnassign = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { secretData, user } = props;
    const refs = useRef({ current: "createMappingForm" });
    const vaultId = props.vaultId;

    const buildForm = () => {
        const fields = [
            {
                type: 'select',
                isMulti: false,
                name: 'secretpoolid',
                label: 'Sub Vaults',
                model: 'SecretPools',
                displayKey: 'poolUuid',
                valueKey: 'id',
                style: { height: '200px' },
                dbType: "pg",
                required: true
            }];

        return (
            <>
                <FormBuilder
                    ref={refs.current}
                    fields={fields}
                />
            </>
        )
    }

    const onClickSave = () => {
        const createMappingForm = refs.current.current;
        const formValues = createMappingForm ? createMappingForm.validateFormAndGetValues() : null;

        if (formValues) {
            setLoading(true);
            const body = {
                secretPoolId: formValues.secretpoolid,
                vaultId: vaultId
            };
            try {
                const method = "POST";
                const uri = `/usermanagement/vault/vaultsecretpoolmapping/create`;
                const userKey = "createdBy";
                body[userKey] = get(props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        setLoading(false);
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
            heading={isEmpty(secretData) ? "Assign Sub Vault" : `Secret : ${get(secretData, 'name', '')}`}
            showModal={showModal}
            closeModal={props.closeModal}
            loading={loading}
            error={error}
        >
            {buildForm()}
            <div className="text-right">
                <Button type="button" color="success" onClick={() => onClickSave()}>Save</Button>
                {'   '}
                <Button type="button" color="danger" onClick={props.closeModal}>Close</Button>
            </div>
        </ModalWindow>
    )
}
const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(AssignUnassign);
