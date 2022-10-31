import React, { Component } from 'react'
import { Row, Button } from 'reactstrap';
import { callApi } from 'store/middleware/api';
import Notify from 'react-s-alert';
import { isEmpty } from 'lodash';

import { Box, BoxBody, BoxHeader } from "components/box";
import FormBuilder from "components/form/FormBuilder";

class CacheClear extends Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            error: null,
            email: "",
            userData: "",
            cacheUserData: false
        }
    }

    //this is used to set the value in the state
    onClickSearch = () => {
        const { searchForm } = this.refs;
        const formValues = searchForm && searchForm.validateFormAndGetValues();
        if (formValues) {
            const { email, appName } = formValues;
            this.setState({ email, appName });
            this.fetchUserFromCache(email, appName);
        }
    }

    //this function is used to call the api
    fetchUserFromCache = async (email, appName) => {
        let cacheKey = !isEmpty(appName) ? email + "_" + appName : email;
        this.setState({ loading: true })
        await callApi(`/usermanagement/employee/fetchUserFromCache/${cacheKey}`, 'GET', null, null, null, true)
            .then(response => {
                Notify.success(`${email} data fetched successfully`);
                this.setState({ loading: false, userData: response, cacheUserData: true })
            })
            .catch((error) => {
                Notify.error(error.message);
                this.setState({ loading: false, userData: null, cacheUserData: false })
            });
    }

    clearUserCache = async () => {
        const { email, appName } = this.state;
        let cacheKey = !isEmpty(appName) ? email + "_" + appName : email;

        this.setState({ loading: true });
        await callApi(`/usermanagement/employee/cache/deleteUserCacheData/${cacheKey}`, 'GET', null, null, null, true)
            .then(reponse => {
                Notify.success(`Cache cleared successfully`);
                this.setState({ loading: false, userData: null, cacheUserData: false })
            })
            .catch((error) => {
                Notify.error(error);
                this.setState({ loading: false });
            })
    }

    getSearchFields = () => {
        return [{
            type: 'select',
            name: 'email',
            model: 'MasterEmployee',
            displayKey: "email",
            valueKey: "email",
            filter: {},
            placeholder: 'Email id',
            required: true,
            helpText: 'Please not loggedIn user data cannot be cleared. Try using impersonating'
        }, {
            type: 'select',
            name: "appName",
            placeholder: 'Application Name',
            options: [
                { label: "OMS", value: "oms" },
                { label: "UMS", value: "ums" },
                { label: "LMS", value: "lms" },
                { label: "IMS", value: "ims" },
                { label: "Common", value: "common" },
                { label: "Middleware", value: "middleware" },
                { label: "Kart", value: "kart" },
                { label: "Payment", value: "payment" },
                { label: "Achieve", value: "achieve" },
                { label: "STMS", value: "stms" },
                { label: "Mentoring", value: "mentoring" },
                { label: "POMS", value: "poms" },
                { label: "SOS", value: "sos" },
                { label: "FMS", value: "fms" },
                { label: "WMS", value: "wms" },
                { label: "CXMS", value: "cxms" },
                { label: "SCAchieve", value: "scachieve" },
                { label: "SCOS", value: "scos" },
                { label: "Counselling", value: "counselling" },
                { label: "UXAchieve", value: "uxachieve" },
                { label: "MOS", value: "mos" },
                { label: "DFOS", value: "dfos" },
                { label: "DFAchieve", value: "dfachieve" },
                { label: "STMS", value: "stms" },
                { label: "Compliance", value: "compliance" }
            ]
        }, {
            type: 'button',
            text: 'Fetch Data',
            className: 'cyan',
            onClick: this.onClickSearch
        }];
    }

    getFromBuilder = () => {
        return [{
            type: 'button',
            text: 'Clear Cache Data',
            bsStyle: 'danger',
            onClick: this.clearUserCache
        }, {
            name: 'userData',
            type: 'textarea',
            placeholder: 'User Data',
            rows: 20,
            disabled: true
        }]
    }

    render() {
        const fields = this.getSearchFields();
        const { userData, loading, error, cacheUserData } = this.state;

        return (
            <Box>
                <BoxBody loading={loading} error={error} >
                    <FormBuilder
                        ref="searchForm"
                        fields={fields}
                        cols={2}
                    />
                    {cacheUserData &&
                        <FormBuilder
                            ref="userDataForm"
                            fields={this.getFromBuilder()}
                            initialValues={{
                                userData: JSON.stringify(userData, null, 4)
                            }}
                            cols={1}
                        />
                    }
                </BoxBody>
            </Box>
        )
    }
}

export default CacheClear;
