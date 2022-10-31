import React, { useState, useRef } from 'react';
import { withRouter } from 'react-router';
import { useDispatch } from "react-redux";

import { Label, Button, Badge } from 'reactstrap';
import ToggleButton from 'react-toggle-button'
import { useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';

import { Box, BoxBody } from 'components/box';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { getEmailFromToken } from '../utils/userUtil';
import { loadUser } from '../../../modules/user/authReducer';

const MultifactorDetails = (props) => {
    const [mfaEnabledFlag, setMfaEnabledFlag] = useState(null);
    const [mfaVerifiedFlag, setMfaVerifiedFlag] = useState(false);
    const [mfaMessage, setMfaMessage] = useState(null);
    const [totp, setTotp] = useState('');
    const [qrCode, setQrCode] = useState(null);
    const dispatch = useDispatch();

    const user = useSelector(state => get(state, 'auth.user'));
    let formRef = useRef();

    const load = () => {
        dispatch(loadUser());
    }

    const buildForm = () => {
        let { isMfaEnabled = false, mfaFactor = {} } = user;
        let toggleValue = (mfaEnabledFlag !== null) ? mfaEnabledFlag : isMfaEnabled;
        let labelValue = "Set up multi-factor authentication";
        if (isEmpty(qrCode)) {
            let savedQrCode = get(mfaFactor, "qrCode", "");
            console.log("QRCode", savedQrCode);
            if (!isEmpty(savedQrCode)) {
                setQrCode(savedQrCode);
            }
        }

        return (
            <div style={{ width: '50%', marginLeft: '5%' }}>
                <Label>{labelValue}</Label>
                <ToggleButton
                    inactiveLabel={''}
                    activeLabel={''}
                    colors={{
                        activeThumb: {
                            base: 'green',
                        },
                        active: {
                            base: 'green',
                            hover: 'rgb(177, 191, 215)',
                        },
                        inactiveThumb: {
                            base: 'blue',
                        },
                        inactive: {
                            base: 'blue',
                            hover: 'rgb(177, 191, 215)',
                        }
                    }}
                    value={toggleValue}
                    onToggle={(value) => onClickToggle(value)} />
                <br />
                {toggleValue && buildMfaForm()}
                <br />

                { }
            </div >
        )
    }

    const buildMfaForm = () => {
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
                <div className="card" style={{ width: '40rem' }}>
                    <div style={{ width: '50%', marginLeft: '25%' }}>
                        <div style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '50%' }}>
                            <div style={{ width: '30rem', marginLeft: '-150px' }}>
                                <div style={{ align: 'left', paddingTop: '15px', fontSize: '13px', marginTop: '11%' }}><b>Complete the following steps to configure your multifactor-authentication.</b></div>
                                <br />
                                <div style={{ align: 'left', paddingTop: '10px' }}><b>Step 1:</b> Install the Google Authenticator App.</div>
                                <div style={{ align: 'left', paddingTop: '10px' }}><b>Step 2:</b> Scan the QR code image below.</div>
                                <div style={{ align: 'left', paddingTop: '10px' }}><img id="imgQrCode" src={qrCode} /></div>
                                <br />
                                <div style={{ align: 'left', paddingTop: '10px' }}><b>Step 3:</b> Then enter the code from your google authenticator app to enable multifactor-authentication.</div>
                                <br />
                                <br />
                                <FormBuilder
                                    ref={formRef}
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
                        <Button id="btnConfirmCode" type="button" color="success" onClick={onConfirmCode}>Set up multi-factor authentication</Button>
                        <br />
                        {mfaVerifiedFlag && <div style={{ marginLeft: '11%', paddingTop: '5px' }}><Badge className="text-uppercase" color="warning">{mfaMessage}</Badge></div>}
                    </div>
                </div>
            </>
        )
    }

    const onClickToggle = async (value) => {
        setMfaEnabledFlag(!value);
        if (!value) {
            await getQRCode();
        }
        else {
            await disableMfa();
        }
    }

    const getQRCode = async () => {
        let url = `/usermanagement/mfa/getQrCode`;
        const method = "GET";
        const qrCodeResponse = await callApi(url, method, null, null, null, true);
        setQrCode(get(qrCodeResponse, "data", ""));
    }

    const onConfirmCode = async () => {
        const formValues = formRef && formRef.current && formRef.current.validateFormAndGetValues();
        const email = await getEmailFromToken();
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
            setMfaVerifiedFlag(true);
            if (verifiedMfa) {
                setMfaMessage("MFA Enabled");

                setTimeout(() => {
                    load();
                    props.tabSelect(3);
                }, 4000);
            }
            else {
                setMfaMessage("Invalid OTP");
            }

            setTotp('');
        }
    }

    const disableMfa = async () => {
        let url = `/usermanagement/mfa/disableMfa`;
        const method = "POST";
        let email = await getEmailFromToken();

        await callApi(url, method, { email }, null, null, true);
        load();
        props.tabSelect(3);
    }

    return (
        <Box>
            <BoxBody>
                {buildForm()}
            </BoxBody>
        </Box>
    );
}

export default withRouter(MultifactorDetails);