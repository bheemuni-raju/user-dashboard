import React from 'react';
import { Button, Badge } from 'reactstrap';
import { get } from 'lodash';

import { Box, BoxBody } from 'components/box';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { getEmailFromToken } from '../utils/userUtil';
import byjusLogo from '../../../assets/img/brand/byjus-logo.jpg';

export default class MultiFactorAuth extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mfaVerifiedFlag: false,
            mfaMessage: null,
        };
    }

    buildMfaForm = () => {
        const fields = [
            {
                type: "text",
                name: "totp",
                label: "Enter Authenticator TOTP",
                style: { width: '300px', marginLeft: '100px' },
            }
        ];

        return (
            <>
                {!this.state.mfaVerifiedFlag &&
                    <div className="card" style={{ width: '30rem', height: '30rem', marginLeft: '35%', border: '1px solid black' }}>
                        <div style={{ width: '30rem', marginLeft: '110px', marginTop: '50px' }}>
                            <div><img src={byjusLogo} className="img-byjus-logo" alt="byjusLogo" style={{ width: '150px', height: '50px', marginLeft: '50px' }} /></div>
                            <div style={{ paddingTop: '10px', fontSize: '20px' }}><b>Multifactor-authentication</b></div>
                            <br />
                            <div style={{ width: '25rem', marginLeft: '-65px', textAlign: 'center', fontSize: '14px', background: '#F2F4F4', padding: '10px' }} >
                                Open Google authenticator app on your device to view your authentication code and verify your identity. This code will be valid for 30 seconds.
                            </div>
                            <br />
                            <div className="fa fa-mobile" style={{ paddingTop: '10px', fontSize: '15px', marginLeft: '52px' }}>&nbsp;&nbsp;<b>Verify your identity</b></div>
                        </div>
                        <br />
                        <FormBuilder
                            ref="formRef"
                            fields={fields}
                            cols={1}
                        />
                        <div className="text-center">
                            <Button id="btnConfirmCode" type="button" color="success" onClick={this.onConfirmCode}>Verify TOTP</Button>
                        </div>
                        {!this.state.mfaVerifiedFlag && <div className="text-center"><Badge className="text-uppercase" color="warning">{this.state.mfaMessage}</Badge></div>}
                    </div>
                }
            </>
        )
    }

    onConfirmCode = async () => {
        const { formRef } = this.refs;
        const formValues = formRef && formRef.validateFormAndGetValues();
        const email = await getEmailFromToken();
        const mfaSessionToken = localStorage.getItem("mfa-session-id")

        if (formValues) {
            const url = `/usermanagement/mfa/verifyTotp`;
            const method = "POST";
            const body = {
                email,
                token: formValues.totp,
                mfaSessionToken
            }
            const verifyOtpResponse = await callApi(url, method, body, null, null, true)
            const verifiedMfa = get(verifyOtpResponse, "verified", "");
            if (verifiedMfa) {
                this.setState({ mfaVerifiedFlag: true });
                this.props.isVerified(verifiedMfa);
            }
            else
                this.setState({ mfaVerifiedFlag: false, mfaMessage: 'Invalid OTP' });
        }
    }

    render() {
        return (
            <Box>
                <BoxBody>
                    {this.buildMfaForm()}
                </BoxBody>
            </Box>
        )
    }
}
