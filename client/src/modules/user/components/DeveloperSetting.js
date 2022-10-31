import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Alert, Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import moment from 'moment';
import Notify from 'react-s-alert';

import { Box, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';

import './DeveloperSetting.scss'

const Profile = () => {
    const [developerToken, setDeveloperToken] = useState(null);
    const [icon, setIcon] = useState()
    const user = useSelector(state => get(state, 'auth.user'));
    const [tokenExpiryDate, setTokenExpiryDate] = useState(null);
    const [tokenCreatedDate, setTokenCreatedDate] = useState(null);


    useEffect(() => {
        getTokenExpiry();
    }, []);

    const buildForm = () => {
        return (
            <div >
                <div>
                    <div>
                        <Button type="button" color="success" onClick={() => onClickGenerateToken()}>Generate New Byju's Developer Token</Button>
                    </div>
                    <br />
                    {tokenExpiryDate && tokenExpiryForm()}
                    <br />
                    <br />
                    {developerToken && buildTokenForm()}
                    <br />
                </div>
                { }
            </div >
        )
    }

    const buildTokenForm = () => {
        return (
            <>
                <div>
                    <Alert color="light" className="developer-setting-main-alert-width">
                        <h4>Developer Token</h4>
                        <Alert color="primary" className="developer-setting-alert-width">
                            Make sure to copy developer token now. You won't be able to see it again!
                        </Alert>
                        <Alert color="secondary" className="developer-setting-alert-width">
                            {developerToken}&emsp;
                            <Button type="button" color="success" onClick={copyToken} className="developer-setting-button-copy-size"><i class={icon} > </i></Button>&emsp;
                            <Button type="button" color="danger" onClick={deleteToken} className="developer-setting-button-size" ><i class="fa fa-trash-o"></i></Button>
                        </Alert>
                    </Alert>
                </div>
            </>
        )
    }

    const tokenExpiryForm = () => {
        return (
            <>
                <div>
                    <Alert color="success" className="developer-setting-expiry-token-alert-width">
                        Token is already generated on {tokenCreatedDate}.It will expires on {tokenExpiryDate}&emsp;
                        <Button type="button" color="danger" onClick={deleteToken} className="developer-setting-button-size"><i class="fa fa-trash-o" ></i></Button>
                    </Alert>
                </div>
            </>
        )
    }

    const getTokenExpiry = async () => {
        const url = `/usermanagement/developertoken/tokenexpiry`;
        const method = "POST";
        const body = {
            email: user.email,
            appName: user.appName
        };
        const tokenDetails = await callApi(url, method, body, null, null, true)
        if (tokenDetails.developerTokenSetting.expireAt) {
            setTokenExpiryDate(moment(tokenDetails.developerTokenSetting.expireAt).format("MMM D YYYY, h:mm a"));
            setTokenCreatedDate(moment(tokenDetails.developerTokenSetting.createdAt).format("MMM D YYYY, h:mm a"));
        }
    }

    const copyToken = async () => {
        try {
            await navigator.clipboard.writeText(developerToken);
            setIcon("fa fa-check");
            Notify.success("Token is copied");
        } catch (error) {
            throw error;
        }
    }

    const deleteToken = async () => {
        setDeveloperToken(null);
        setTokenExpiryDate(null);
        const url = `/usermanagement/developertoken/delete`;
        const method = "POST";
        const body = {
            email: user.email,
            appName: user.appName
        };
        await callApi(url, method, body, null, null, true)
    }

    const onClickGenerateToken = (value) => {
        setDeveloperToken(null);
        setTokenExpiryDate(null);
        setIcon("fa fa-copy");
        getToken();
    }

    const getToken = async () => {
        const url = `/usermanagement/developertoken/generate`;
        const method = "POST";
        const body = {
            email: user.email,
            appName: user.appName
        };
        const tokenResponse = await callApi(url, method, body, null, null, true)
        setDeveloperToken(tokenResponse);
    }

    return (
        <Box>
            <BoxBody>
                {buildForm()}
            </BoxBody>
        </Box>
    )
}

export default withRouter(Profile)
