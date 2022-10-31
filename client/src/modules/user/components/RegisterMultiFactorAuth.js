import React, { useState, useRef, useEffect } from 'react';
//import { withRouter } from 'react-router';
import { useDispatch } from "react-redux";

import { Label, Button, Badge } from 'reactstrap';
import { useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';

import { Box, BoxBody } from 'components/box';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { getEmailFromToken } from '../utils/userUtil';
import { loadUser } from '../../../modules/user/authReducer';

export default class RegisterMultiFactorAuth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mfaVerifiedFlag: false,
            mfaMessage: null,
            totp: '',
            qrCode: null,
        };
    }

    componentDidMount = async () => {
        const url = `/usermanagement/mfa/getQrCode`;
        const method = "GET";
        const qrCodeResponse = await callApi(url, method, null, null, null, true);
        const qrCodeData = get(qrCodeResponse, "data", "");
        this.setState({ qrCode: qrCodeData });
    }

    buildMfaForm = () => {
        const { qrCode, totp, mfaVerifiedFlag, mfaMessage } = this.state
        const fields = [
            {
                type: "text",
                name: "totp",
                label: "Enter Authenticator TOTP",
                style: { width: "210px" }
            }
        ];

        return (
            <>
                <div className="card" style={{ width: '40rem', marginLeft: '25%' }}>
                    <div style={{ width: '50%', marginLeft: '25%' }}>
                        <div style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '50%' }}>
                            <div style={{ width: '30rem', marginLeft: '-150px' }}>
                                <div style={{ align: 'center', paddingTop: '15px', fontSize: '20px', marginTop: '11%' }}><b>BYJUS USER MANAGEMENT SYSTEM</b></div>
                                <div style={{ align: 'left', paddingTop: '5px', fontSize: '13px', marginTop: '8%' }}><b>Complete the following steps to configure your multifactor-authentication.</b></div>
                                <br />
                                <div style={{ align: 'left', paddingTop: '10px' }}><b>Step 1:</b> Install the Google Authenticator App.</div>
                                <div style={{ align: 'left', paddingTop: '10px' }}><b>Step 2:</b> Scan the QR code image below.</div>
                                <div style={{ align: 'left', paddingTop: '10px' }}><img id="imgQrCode" src={qrCode} /></div>
                                <br />
                                <div style={{ align: 'left', paddingTop: '10px' }}><b>Step 3:</b> Then enter the code from your google authenticator app to enable multifactor-authentication.</div>
                                <br />
                                <br />
                                <FormBuilder
                                    ref="formRef"
                                    fields={fields}
                                    cols={1}
                                    initialValues={{
                                        totp
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ align: 'left', paddingTop: '5px', marginLeft: '11%', marginBottom: '11%' }}>
                        <Button id="btnConfirmCode" type="button" color="success" onClick={this.onConfirmCode}>Set up multi-factor authentication</Button>
                        <br />
                        {mfaVerifiedFlag && <div style={{ marginLeft: '11%', paddingTop: '5px' }}><Badge className="text-uppercase" color="warning">{mfaMessage}</Badge></div>}
                    </div>
                </div>
            </>
        )
    }

    onConfirmCode = async () => {
        const { formRef } = this.refs;
        const formValues = formRef && formRef.validateFormAndGetValues();
        let email = await getEmailFromToken();
        const mfaSessionToken = localStorage.getItem("mfa-session-id")

        if (formValues) {
            let url = `/usermanagement/mfa/enableMfa`;
            const method = "POST";
            let body = {
                token: formValues.totp,
                email,
                mfaSessionToken
            }
            const verifyOtpResponse = await callApi(url, method, body, null, null, true)
            let verifiedMfa = get(verifyOtpResponse, "verified", "");
            this.setState({ mfaVerifiedFlag: true })
            if (verifiedMfa) {
                this.setState({ mfaMessage: "MFA Enabled" });
                this.props.isVerified(verifiedMfa);
            }
            else {
                this.setState({ mfaMessage: 'Invalid OTP' });
            }

            this.setState({ totp: '' });
        }
    }

    render() {
        return (
            <Box>
                <BoxBody>
                    {this.buildMfaForm()}
                </BoxBody>
            </Box>
        );
    }
}
