import React, { useState, useRef, useEffect } from 'react';
import { startCase, get, snakeCase, isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import Notify from 'react-s-alert';
import axios from 'axios';

import Drawer from 'components/drawer/Drawer';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const SecurityReportForm = (props) => {
    const { onClose, refreshGrid, securityReportData, actionType } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [application, setApplication] = useState("");
    let formRef = useRef();

    useEffect(()=>{
        getApplication();
    },[]);

    const getApplication = async() => {
        setError(null);
        setLoading(true);
        await callApi('/usermanagement/analyticsmanagement/securitymanagement/getApplications', `POST`, {}, null, null, true)
        .then((response)=>{
            const app = response.map(result => {return {'label': result.name, 'value': result.formattedName}});
            setLoading(false);
            setApplication(app);
        }).catch((error)=>{
            setLoading(false);
            setError(error.message);
        });
    }

    const formatFormData = (formValues) => {
        const { securityReportData, actionType } = props;
        const { vertical, application, description, reportDateAt, reportCuratedBy, applicationLeadName, uploadFile } = formValues;
        if(actionType === 'CREATE') {
            const formData = new FormData();
            formData.append('uploadedFileType', get(uploadFile,'type'));
            formData.append('uploadedFile', uploadFile);
            formData.append('reportName', get(uploadFile, 'name'));
            formData.append('vertical', vertical);
            formData.append('application', application);
            formData.append('description', description);
            formData.append('reportDateAt', reportDateAt);
            formData.append('reportCuratedBy', reportCuratedBy);
            formData.append('applicationLeadName', applicationLeadName);
            return formData;
        }
        const { reportId='' } = securityReportData;
        return {
            ...formValues,
            reportId
        }
    }

    const onClickCreate = async () => {
        const formValues = formRef && formRef.current && formRef.current.validateFormAndGetValues();
        const formData = formatFormData(formValues);
        
        const method = actionType === "UPDATE" ? "put" : "post";
        const uri = actionType === "CREATE" ? `usermanagement/analyticsmanagement/securitymanagement/createReport` : `usermanagement/analyticsmanagement/securitymanagement/report`;
        const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";
        
        if (formData) {
            setError(null);
            setLoading(true);
            await axios({
                method: method,
                url: `${window.NAPI_URL}/${uri}`,
                headers: {
                    'encType' : "multipart/form-data",
                    'Accept' : 'application/json'
                },
                data: formData
            }).then(response => {
                setLoading(false);
                Notify.success(`${get(response, 'data.details.reportId')} is successfully uploaded.`);
                refreshGrid();
                onClose();
            })
            .catch(error => {
                setLoading(false);
                setError(error.message);
            }); 
        }
    }

    const buildForm = () => {
        const { securityReportData, actionType } = props;
        let fields = [{
            type: 'select',
            label: 'Vertical',
            name: "vertical",
            options: [
                {label: 'Digital Finance Tech', value: 'digital_finance_tech'},
                {label: 'Sales Tech', value: 'sales_tech'},
                {label: 'UX Tech', value: 'ux_tech'},
                {label: 'ST Tech', value: 'st_tech'},
                {label: 'Supply Chain Tech', value: 'supply_chain_tech'},
                {label: 'Data Engineering', value: 'data_engineering'},
                {label: 'Devops', value: 'devops'},
                {label: 'Website tech', value: 'website_tech'},
                {label: 'Learn Portal Tech', value: 'learn_portal_tech'},
                {label: 'Marketing Tech', value: 'marketing_tech'},
                {label: 'Assessment Tech', value: 'assessment_tech'},
                {label: 'Finance Tech', value: 'finance_tech'},
                {label: 'Kart Tech', value: 'kart_tech'}
            ],
            placeholder: 'Select Vertical',
            required: true
        }, {
            type: 'select',
            label: 'Application',
            name: "application",
            options: application,
            placeholder: 'Select Application',
            required: true
        }, {
            type: 'textarea',
            label: 'Description',
            name: "description",
            placeholder: 'Please add description about the security report',
            required: true
        }, {
            type: 'date',
            label: 'Date of Report',
            name: "reportDateAt",
            placeholder: 'Report Created At',
            required: true
        }, {
            type: 'select',
            label: 'Report Curated By',
            name: "reportCuratedBy",
            model: "MasterEmployee",
            displayKey: "name",
            valueKey: "name",
            required: true
        }, {
            type: 'select',
            label: 'Application Lead Name',
            name: "applicationLeadName",
            model: "MasterEmployee",
            displayKey: "name",
            valueKey: "name",
            placeholder: '',
            required: true
        }, actionType === 'CREATE' && {
            type: 'file',
            label: 'Upload Report File',
            name: "uploadFile",
            placeholder: 'Please upload the security report',
            required: true,
        }]

        const initialValues = securityReportData && actionType==='UPDATE' ? securityReportData : {};
        return (
            <>
                <FormBuilder
                    ref={formRef}
                    fields={fields}
                    initialValues={initialValues}
                />
            </>
        )
    }

    return (
        <Drawer title="New Security Report" 
            onClose={onClose}
            loading={loading}
            error={error}
            zIndex={1040}
            placement="right"
            closable={true}
            visible={true}
        >
            <>
                {buildForm()}
                <div className="text-right">
                    <Button type="button" color="success" onClick={onClickCreate}>Create</Button>
                    {'   '}
                    <Button type="button" color="danger" onClick={onClose}>Close</Button>
                </div>
            </>
        </Drawer>
    );
}

export default SecurityReportForm;