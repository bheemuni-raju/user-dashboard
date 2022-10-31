import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const SecretModal = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { secretData, user } = props;
    const refs = useRef({ current: "createSecretForm" });
    const [value, setValue] = useState(null);
    const [isRevealValue, setRevealValue] = useState(false);
    const buildForm = () => {

        const fields = [{
            type: 'text',
            name: 'name',
            label: 'Name',
            required: true
        },
        {
            type: 'password',
            name: 'value',
            label: 'Value',
            required: true
        }
            // {
            //     type: 'select',
            //     name: 'type',
            //     label: 'Type',
            //     options: [
            //         { label: "Infra Secret", value: "infra_secret" },
            //         { label: "Vendor Secret", value: "vendor_secret" },
            //         { label: "Application Secret", value: "application_secret" },
            //         { label: "Other Type Of Secrets", value: "other_type_of_secrets" }
            //     ],
            //     required: true
            // }
        ];

        const initialValues = props.actionType === "UPDATE" ? secretData : {}

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
        const { secretData, actionType } = props;
        const createSecretForm = refs.current.current;
        const formValues = createSecretForm ? createSecretForm.validateFormAndGetValues() : null;

        if (formValues) {
            setLoading(true);
            const body = {
                ...formValues,
                secretPoolId: props.poolId,
                type: "infra_secret"
            };

            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/vault/secret/create` : `/usermanagement/vault/secret/update`;
                const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";

                body[userKey] = get(props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        props.refreshGrid();
                        props.closeModal("save");
                    })
                    .catch(error => {
                        setError(error);
                        if (error.status == 403) {
                            setError(error.errorMessage);
                        }
                        //setState({ loading: false, error });
                        setLoading(false);
                    })
            } catch (error) {
                setLoading(false);
                setError(error);
            }
        }
    }


    return (
        <ModalWindow
            heading={isEmpty(secretData) ? "Create Secret" : `Name : ${get(secretData, 'name', '')}`}
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

export default connect(mapStateToProps)(SecretModal);
