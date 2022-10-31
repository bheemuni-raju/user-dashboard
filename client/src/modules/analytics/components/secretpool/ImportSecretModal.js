import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { _, get, isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import { parse } from "dotenv";
import { useHistory, Link } from 'react-router-dom';

import { Box, BoxHeader, BoxBody } from 'components/box';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { SECRET_TYPES } from '../../../../config/vaultConfig'

const SecretModal = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { secretData, user } = props;
    const refs = useRef({ current: "createSecretForm" });
    const history = useHistory();
    const secretPoolId = props.match.params.secret;

    const buildForm = () => {
        // const fields = [];

        // SECRET_TYPES.map(data => {
        //     const obj = {
        //         type: 'textarea',
        //         name: data.value,
        //         label: data.label,
        //         required: false,
        //         placeholder: "Please enter data as shown in below format\nPG_URL = pgurl://test/connect\nSESSION_SECRET = byjus",
        //         style: { 'height': '200px','weight': '100px' }
        //     }

        //     fields.push(obj);
        // })

        const fields = [{
            type: 'textarea',
            name: 'vendor_secret',
            label: 'Secrets',
            required: true,
            placeholder: "Please enter data as shown in below format\nPG_URL = pgurl://test/connect\nSESSION_SECRET = byjus",
            style: { 'height': '500px','weight': '100px' }
        }]

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
        const createdBy = get(props.user, 'email', "");
        const createSecretForm = refs.current.current;
        const formValues = createSecretForm ? createSecretForm.validateFormAndGetValues() : null;
        const result = [];

        // if (formValues.infra_secret) {
        //     let infra_secret = formValues.infra_secret.replace(/ /g, '');
        //     infra_secret = infra_secret.split('   ');
        //     const parsedInfra_secret = parse(infra_secret[0]);
        //     const objectArrayInfra_secret = Object.entries(parsedInfra_secret);
        //     objectArrayInfra_secret.forEach(([key, value]) => {
        //         let obj = { name: key.toUpperCase(), value: value, type: 'infra_secret', secretPoolId: secretPoolId, createdBy: createdBy };
        //         result.push(obj);
        //     });
        // }


        if (formValues.vendor_secret) {
            let vendorSecret = formValues.vendor_secret.replace(/ /g, '');
            vendorSecret = vendorSecret.split('   ');
            const parsedVendorSecret = parse(vendorSecret[0]);
            const objectArrayVendorSecret = Object.entries(parsedVendorSecret);

            objectArrayVendorSecret.forEach(([key, value]) => {
                let obj = { name: key.toUpperCase(), value: value, type: 'vendor_secret', secretPoolId: secretPoolId, createdBy: createdBy };
                result.push(obj);
            });
        }

        // if (formValues.application_secret) {
        //     let applicationSecret = formValues.application_secret.replace(/ /g, '');
        //     applicationSecret = applicationSecret.split('   ');
        //     const parsedApplicationSecret = parse(applicationSecret[0]);
        //     const objectArrayApplicationSecret = Object.entries(parsedApplicationSecret);

        //     objectArrayApplicationSecret.forEach(([key, value]) => {
        //         let obj = { name: key.toUpperCase(), value: value, type: 'application_secret', secretPoolId: secretPoolId, createdBy: createdBy };
        //         result.push(obj);
        //     });
        // }
        // if (formValues.other_type_of_secrets) {
        //     let otherTypeSecrets = formValues.other_type_of_secrets.replace(/ /g, '');
        //     otherTypeSecrets = otherTypeSecrets.split('   ');
        //     const parsedOtherTypeSecrets = parse(otherTypeSecrets[0]);
        //     const objectArrayOtherTypeSecrets = Object.entries(parsedOtherTypeSecrets);

        //     objectArrayOtherTypeSecrets.forEach(([key, value]) => {
        //         let obj = { name: key.toUpperCase(), value: value, type: 'other_type_of_secrets', secretPoolId: secretPoolId, createdBy: createdBy };
        //         result.push(obj);
        //     });
        // }

        // if (isEmpty(result)) {
        //     setError("Please add atleast one secret.");
        //     return false;
        // }

        if (formValues) {
            setLoading(true);
            const body = {
                secretDetails: result,
            };

            try {
                const method = "POST";
                const uri = `/usermanagement/vault/secret/bulkCreate`;

                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        setLoading(false);
                        setError(false);
                        history.goBack();
                    })
                    .catch(error => {
                        setError(error);
                        if (error.status == 403) {
                            setError(error.errorMessage);
                        }
                        setLoading(false);
                    })
            } catch (error) {
                setLoading(false);
                setError(error);
            }
        }
    }

    return (
        <Box>
            {/* <BoxHeader heading="Add secrets" /> */}
            <BoxBody loading={loading} error={error}>
                {buildForm()}
                <div className="text-center">
                    <Button type="button" color="success" onClick={() => onClickSave()}>Upload</Button>
                    {'   '}
                    <Button type="button" color="danger" onClick={history.goBack
                    }>Cancel</Button>
                </div>
            </BoxBody>

        </Box>

    )

}



const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(SecretModal);
