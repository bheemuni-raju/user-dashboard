import React, { useState, useRef } from 'react';
import { startCase, get, snakeCase } from 'lodash';
import { Button } from 'reactstrap';
import Notify from 'react-s-alert';

import Drawer from 'components/drawer/Drawer';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

import { isValidHttpUrl } from 'utils/componentUtil';

const DeploymentRequestForm = (props) => {
    const { onClose, refreshGrid } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [team, setTeam] = useState("");
    const [application, setApplication] = useState("");
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [applicationConfig, setApplicationConfig] = useState({});
    let devops = "", qa = "", lead = "";
    const formRef = useRef();

    const getApplicationConfig = async (application) => {
        if (application) {
            const body = {
                team, application
            }
            setLoading(true);
            callApi(`/usermanagement/settings/devopsinfra/getApplicationConfig`, 'POST', body, null, null, true)
                .then((reponse) => {
                    setLoading(false);
                    setApplicationConfig(reponse);
                    const servicesKeys = Object.keys(get(reponse, 'serviceApproverDetails', {}));
                    setServices(servicesKeys.map((key) => { return { label: startCase(key), value: key } }));
                })
                .catch((error) => {
                    setLoading(false);
                    setError(error);
                });
        }
        else {
            setApplicationConfig({});
        }
    }

    const onChangeTeam = (value, name) => {
        setTeam(value);
        setApplication(null);
        getApplicationConfig(null);
    }

    const onChangeApplication = (value, name) => {
        setApplication(value);
        getApplicationConfig(value);
    }

    const onChangeServiceSelected = (value, name) => {
        setSelectedService(value);
    }

    const getFields = () => {
        let fields = [{
            type: 'select',
            label: 'Environment',
            name: "environment",
            options: [
                { label: "Development", value: "development" },
                { label: "UAT", value: "uat" },
                { label: "Production", value: "production" }
            ],
            placeholder: 'Select Environment',
            required: true
        }, {
            type: 'select',
            label: 'Team',
            name: "team",
            options: [
                { label: "Upstream", value: "upstream" },
                { label: "Downstream", value: "downstream" },
                { label: "Digital Finance", value: "digital_finance" }
            ],
            onChange: onChangeTeam,
            placeholder: 'Select Team',
            required: true
        }, {
            type: 'select',
            label: 'Application',
            name: "application",
            filter: { team },
            model: 'DevopsInfraConfig',
            displayKey: 'application',
            valueKey: 'application',
            onChange: onChangeApplication,
            placeholder: 'Select Application',
            required: true
        }, {
            type: 'select',
            label: 'Requesting For Service',
            name: "serviceRequested",
            options: services,
            onChange: onChangeServiceSelected,
            placeholder: 'Select the service required',
            required: true
        }, {
            type: 'text',
            label: 'PR / Repo Link',
            name: "repositoryLink",
            placeholder: 'Github url pointing to the exact file/folder to be deployed for job/worker/datafix/application.',
            required: true
        }, {
            type: 'textarea',
            label: 'Release Notes / Description',
            name: "description",
            rows: 11,
            placeholder: `* Please provide the release notes for this deployment. This will help QA to smoke test the same post deployment.

* Datafix requests : Provide details -> Db Name, Collection Name, Operation types(insert,update,read,delete), Number of records & Back up needed(yes/no) in description.
`,
            required: true
        }];

        if (application) {
            fields.push({
                type: 'readonlytext',
                label: 'To be Approved By',
                name: "lead",
                value: get(applicationConfig.serviceApproverDetails, selectedService)
            }, {
                type: 'readonlytext',
                label: 'To be Deployed By',
                name: "devops",
                value: get(applicationConfig, 'devopsEmail')
            }, {
                type: 'readonlytext',
                label: 'To be Smoke Tested By',
                name: "qa",
                value: get(applicationConfig, 'qaEmail')
            });
        }

        return fields;
    }

    const validateValues = (formValues) => {
        let validationErrors = {};

        if (!isValidHttpUrl(get(formValues, 'repositoryLink'))) {
            validationErrors['repositoryLink'] = 'Please enter a valid url.';
        }
        return validationErrors;
    }

    const onClickCreate = async () => {
        const formValues = formRef && formRef.current && formRef.current.validateFormAndGetValues();

        if (formValues) {
            setError(null);
            setLoading(true);
            const toBeApprovedBy = get(applicationConfig.serviceApproverDetails || {}, selectedService);
            const devOps = get(applicationConfig, 'devopsEmail');
            const qa = get(applicationConfig, 'qaEmail');
            await callApi(`/usermanagement/analyticsmanagement/deploymentrequest/createRequest`, 'POST', {
                team,
                application,
                assignedTo: toBeApprovedBy,
                toBeApprovedBy: toBeApprovedBy,
                toBeDeployedBy: devOps,
                toBeSmokeTestedBy: qa,
                ...formValues
            }, null, null, true)
                .then(response => {
                    setLoading(false);
                    Notify.success(`${get(response, 'requestId')} is successfully created.`);
                    refreshGrid();
                    onClose();
                })
                .catch(error => {
                    setLoading(false);
                    setError(error.message);
                });
        }
    }

    return (
        <Drawer title="New Deployment Request" onClose={onClose} loading={loading} error={error} >
            <>
                <FormBuilder
                    ref={formRef}
                    fields={getFields()}
                    initialValues={{
                        lead: get(applicationConfig.serviceApproverDetails || {}, selectedService),
                        devops: get(applicationConfig, 'devopsEmail'),
                        qa: get(applicationConfig, 'qaEmail')
                    }}
                    validateValues={validateValues}
                />
                <div className="text-right">
                    <Button type="button" color="success" onClick={onClickCreate}>Create</Button>
                    {'   '}
                    <Button type="button" color="danger" onClick={onClose}>Close</Button>
                </div>
            </>
        </Drawer>
    );
}

export default DeploymentRequestForm;