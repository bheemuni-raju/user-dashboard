import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useHistory, useParams } from 'react-router';

import TabBuilder from 'modules/core/components/TabBuilder';
import { get, startCase, upperCase, isEmpty } from 'lodash';
import { Button, Badge } from 'reactstrap';
import ByjusDropdown from 'components/ByjusDropdown';

import { callApi } from 'store/middleware/api';
import LoadingWrapper from 'components/LoadingWrapper';

import SmsTemplatesTab from 'modules/settings/components/communication/smstemplates/SmsTemplatesTab';
import SmsTransactionsTab from 'modules/settings/components/communication/smstransactions/SmsTransactionsTab';
import SmsTemplateStatusTimeLineDrawer from 'modules/settings/components/communication/smstemplates/SmsTemplateStatusTimeLineDrawer';
import SmsTemplateStatusLabel from 'modules/settings/components/communication/smstemplates/SmsTemplateStatusLabel';

const SmsTemplateDetails = (props, ref) => {
    const { resize, maximized, refreshGrid, fetchActionItemsBasedOnStatus } = props;
    const [loading, setLoading] = useState(false);
    const [smsTemplateData, setSmsTemplateData] = useState({});
    const [smsTransactionsData, setSmsTransactionsData] = useState({});
    const [showTemplateStatusTimeLine, setShowTemplateStatusTimeLine] = useState(false)
    const history = useHistory();

    const { templateId } = useParams();

    useEffect(() => {
        loadSmsTemplateDetails();
        loadSmsTransactionsDetails();
    }, [templateId])

    useImperativeHandle(ref, () => ({
        refreshSmsTemplate() {
            loadSmsTemplateDetails();
            loadSmsTransactionsDetails();
        }
    }))

    async function loadSmsTemplateDetails() {
        try {
            setLoading(true);
            const apiResponse = await callApi(`/usermanagement/smstemplate/${templateId}`, 'GET', null, null, null, true);
            setLoading(false);
            setSmsTemplateData(apiResponse);
        }
        catch (e) {
            console.log(`Error while fetching sms template details`, e.message);
        }
    }

    async function loadSmsTransactionsDetails() {
        try {
            setLoading(true);
            const apiResponse = await callApi(`/usermanagement/smstransactions/transactionByTemplate/${templateId}`, 'GET', null, null, null, true);
            setLoading(false);
            setSmsTransactionsData(apiResponse);
        }
        catch (e) {
            console.log(`Error while fetching sms template details`, e.message);
        }
    }

    const onClickRefresh = () => {
        loadSmsTemplateDetails();
        loadSmsTransactionsDetails();
        refreshGrid();
    }

    let tabs = [{
        icon: 'fa fa-info',
        title: 'Template Details',
        component: <SmsTemplatesTab {...props} smsTemplateData={smsTemplateData} />
    }, {
        icon: 'fa fa-mobile',
        title: 'Transactions',
        component: <SmsTransactionsTab {...props} smsTransactionsData={smsTransactionsData} smsTemplateData={smsTemplateData} />
    }]

    let actions = fetchActionItemsBasedOnStatus(smsTemplateData);

    return (
        <div className="pane-right mb-0">
            <LoadingWrapper loading={loading}>
                <div className="details-header clearfix">
                    <i className="fa fa-arrow-left btn-link fa-lg mr-1" aria-hidden="true" onClick={history.goBack} />
                    <span className="h4 align-middle">{`#${templateId || ""}`} </span>
                    <SmsTemplateStatusLabel formatter={upperCase} status={get(smsTemplateData, 'status', '')} className="text-uppercase" />&nbsp;
                    <Badge color="info" className="font-weight-normal">{startCase(get(smsTemplateData, 'name'))}</Badge>
                    <div className="d-inline-block float-right">
                        {actions.some(Boolean) && <ByjusDropdown defaultTitle={<i className="fa fa-bars" />} type="simple"
                            items={actions}
                        />}{" "}
                        <Button
                            color="primary"
                            title="Sms template status history"
                            onClick={() => setShowTemplateStatusTimeLine(true)}
                        >
                            <i className="fa fa-calendar" />
                        </Button>{" "}
                        <Button color="success" title="Refresh details" onClick={() => onClickRefresh()}>
                            <i className="fa fa-refresh" />
                        </Button>{" "}
                        {
                            resize && <Button color="warning" onClick={resize} title={maximized ? 'Minimize' : 'Maximize'}>
                                <i className={`fa fa-${maximized ? 'compress' : 'expand'}`}></i>
                            </Button>
                        }{" "}
                        <Button color="danger" className="ml-1" onClick={() => history.push('/settings/sms-templates')}>
                            <i className="fa fa-times"></i>
                        </Button>
                    </div>
                </div>
                <div className="details-body custom-scrollbar">
                    <div className="details-tabs">
                        <TabBuilder tabs={tabs}></TabBuilder>
                    </div>
                </div>
            </LoadingWrapper>

            <SmsTemplateStatusTimeLineDrawer
                actionDetails={get(smsTemplateData, "actionDetails", {})}
                visible={showTemplateStatusTimeLine}
                onClose={() => setShowTemplateStatusTimeLine(false)}
            />
        </div>
    )
}

export default forwardRef(SmsTemplateDetails);