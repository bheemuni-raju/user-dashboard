import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Badge, Row, Col, Button, CustomInput } from 'reactstrap';
import { get, startCase, remove } from 'lodash';
import moment from 'moment';
import Notify from 'react-s-alert';

import { Box, BoxBody } from 'components/box';
import TabBuilder from 'modules/core/components/TabBuilder';
import ByjusDropdown from 'components/ByjusDropdown';
import { callApi } from 'store/middleware/api';
import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import Drawer from 'components/drawer/Drawer';
import { deploymentRequest, validatePermission } from 'lib/permissionList';

import Comment from './Comment';
import { teamMap, statusColourMap, getOperationChecklist } from './config';
import { isValidHttpUrl } from 'utils/componentUtil';

import StatusTimelineDrawer from "./StatusTimeLineDrawer";

const DeploymentRequestDetails = (props) => {
    const { match = {}, refreshGrid } = props;
    const { drId } = match.params || {};
    const user = useSelector(state => get(state, 'auth.user'));
    const formRef = useRef();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requestId, setRequestId] = useState(drId);
    const [details, setDetails] = useState();
    const [showConfirmationModal, setShowConfimationModal] = useState(false);
    const [operation, setOperation] = useState("");
    const [selectedCheckList, setSelectedCheckList] = useState([]);
    const [disableProceed, setDisableProceed] = useState(true);
    const [confirmationFormValues, setConfirmationFormValues] = useState({});
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [applicationConfig, setApplicationConfig] = useState({});

    const confirmationForm = useRef();
    const { status, application, team, previousStatus } = details || {};
    const canApproveDR = validatePermission(user, deploymentRequest.approveDeploymentRequest);
    const canEditDR = validatePermission(user, deploymentRequest.editDeploymentRequest);
    const canSmokeTestDR = validatePermission(user, deploymentRequest.smokeTestDeploymentrequest);
    const canDeployDR = validatePermission(user, deploymentRequest.deployDeploymentRequest);

    useEffect(() => {
        setRequestId(drId);
        loadDetails();
    }, [drId])

    const loadDetails = async () => {
        setError(null);
        setLoading(true);
        await callApi(`/usermanagement/analyticsmanagement/deploymentrequest/getDetails`, 'POST', {
            requestId
        }, null, null, true)
            .then(response => {
                setDetails(response);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error.message);
            });
    }

    const onClickClone = () => {
        const { team, application } = details || {};
        const body = { team, application }

        setLoading(true);
        callApi(`/usermanagement/settings/devopsinfra/getApplicationConfig`, 'POST', body, null, null, true)
            .then((response) => {
                console.log('responses', response);
                setLoading(false);
                setApplicationConfig(response);
            })
            .catch((error) => {
                setLoading(false);
                setError(error);
            });
        setShowCloneModal(true);
    }

    const onClickClose = () => {
        setShowCloneModal(false);
    }


    const getAssignedTo = (status) => {
        let assignedTo = "";

        if (status === "approved") {
            assignedTo = get(details, 'toBeDeployedBy');
        }
        else if (status === "deployed") {
            assignedTo = get(details, 'toBeSmokeTestedBy');
        }
        else {
            assignedTo = null;
        }

        return assignedTo;
    }

    const updateRequestStatus = async (status) => {
        let assignedTo = getAssignedTo(status);

        const confirmationFormValues = confirmationForm && confirmationForm.current && confirmationForm.current.validateFormAndGetValues();
        if (!confirmationFormValues) return;

        setError(null);
        setLoading(true);
        await callApi(`/usermanagement/analyticsmanagement/deploymentrequest/updateRequestStatus`, 'POST', {
            requestId,
            status,
            assignedTo,
            previousStatus,
            ...confirmationFormValues,
            team, application
        }, null, null, true)
            .then(response => {
                loadDetails();
                closeConfirmationModal();
                setDisableProceed(true);
                setSelectedCheckList([]);
                refreshGrid();
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error.message);
            });
    }

    const getActions = () => {
        return [{
            title: 'Approve Request',
            disabled: !(status === "created"),
            onClick: () => { setShowConfimationModal(true); setOperation("approved"); },
            isAllowed: canApproveDR || (details && user.email == details.toBeApprovedBy)
        }, {
            title: 'Reject Request',
            disabled: !(status === "created"),
            onClick: () => { setShowConfimationModal(true); setOperation("rejected"); },
            isAllowed: canApproveDR || (details && user.email == details.toBeApprovedBy)
        }, {
            title: 'Mark Hold',
            disabled: (["deployed", "smoke_tested", "rejected", "hold", "created"].includes(status)),
            onClick: () => { setShowConfimationModal(true); setOperation("hold"); setDisableProceed(false) },
            isAllowed: canDeployDR || (details && user.email == details.toBeDeployedBy)
        }, {
            title: 'Mark In-Progress',
            disabled: (["created", "deployed", "smoke_tested", "rejected", "in_progress"].includes(status)),
            onClick: () => { setShowConfimationModal(true); setOperation("in_progress"); setDisableProceed(false) },
            isAllowed: canDeployDR || (details && user.email == details.toBeDeployedBy)
        }, {
            title: 'Mark Deployed',
            disabled: !(["approved", "in_progress"].includes(status)),
            onClick: () => { setShowConfimationModal(true); setOperation("deployed"); },
            isAllowed: canDeployDR || (details && user.email == details.toBeDeployedBy)
        }, {
            title: 'Mark Smoke Tested',
            disabled: !(status === "deployed"),
            onClick: () => { setShowConfimationModal(true); setOperation("smoke_tested"); },
            isAllowed: canSmokeTestDR || (details && user.email == details.toBeSmokeTestedBy)
        }];
    }

    const createClone = async () => {
        const formValues = formRef && formRef.current && formRef.current.validateFormAndGetValues();

        if (formValues) {
            const {
                toBeApprovedBy,
                toBeDeployedBy,
                toBeSmokeTestedBy,
                team
            } = details || {};
            setError(null);
            setLoading(true);
            await callApi(`/usermanagement/analyticsmanagement/deploymentrequest/createRequest`, 'POST',
                {
                    devops: toBeDeployedBy,
                    lead: toBeApprovedBy,
                    qa: toBeSmokeTestedBy,
                    team: team,
                    assignedTo: toBeApprovedBy,
                    toBeApprovedBy: toBeApprovedBy,
                    toBeDeployedBy: toBeDeployedBy,
                    toBeSmokeTestedBy: toBeSmokeTestedBy,
                    ...formValues
                }, null, null, true)
                .then(response => {
                    setLoading(false);
                    Notify.success(`${get(response, 'requestId')} is successfully created.`);
                    refreshGrid();
                    onClickClose();
                })
                .catch(error => {
                    setLoading(false);
                    setError(error.message);
                });
        }
    }

    const onChangeCheckList = (e) => {
        let currentCheckList = selectedCheckList;

        setError(null);
        if (selectedCheckList.includes(e.target.name)) {
            remove(currentCheckList, (c) => c === e.target.name)
        } else {
            currentCheckList.push(e.target.name);
        }
        const isAllChecked = getOperationChecklist(operation).length !== currentCheckList.length;
        setDisableProceed(isAllChecked);
        setSelectedCheckList(currentCheckList);
    }

    const onChangeConfirmationFormField = (value, name) => {
        const formValues = confirmationFormValues;

        formValues[name] = value;
        setConfirmationFormValues(formValues);
    }

    const closeConfirmationModal = () => {
        setShowConfimationModal(false);
        setDisableProceed(true);
        setSelectedCheckList([]);
    }

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <div className="h4">
                    {requestId && <span className="font-weight-bold pr-2">{requestId}</span>}
                    <span className="pr-2"><Badge className="text-uppercase" color={statusColourMap[status]}>{startCase(status)}</Badge></span>
                    <span className="pr-2"><Badge className="text-uppercase" color="warning">{application}</Badge></span>
                    <div className="d-inline-block float-right">
                        <Button color="primary" size="sm" onClick={onClickClone} >Clone
                        </Button>{" "}
                        <ByjusDropdown defaultTitle="Action" type="simple"
                            items={getActions()}
                        />{" "}
                        <Button color="success" size="sm" title="Refresh details" onClick={loadDetails}>
                            <i className="fa fa-refresh" />
                        </Button>{" "}
                        <Link to={`/manage-lpm/closure-requests`} className="ant-btn btn-danger" title={`Close`}>
                            <i className="fa fa-times"></i>
                        </Link>
                    </div>
                </div>
                <TabBuilder
                    tabs={[{
                        title: "Details",
                        component: <Details details={details} />
                    }, {
                        title: "Comments",
                        component: <Comment drId={requestId} />
                    }]} />
                {showConfirmationModal &&
                    <ModalWindow
                        loading={loading}
                        error={error}
                        showModal={showConfirmationModal}
                        closeModal={closeConfirmationModal}
                        heading={`Review ${getOperationMessage(operation)}`}
                        okText="Proceed"
                        onClickOk={() => updateRequestStatus(operation)}
                    >
                        <ConfirmationForm
                            details={details}
                            operation={operation}
                            onChangeCheckList={onChangeCheckList}
                            confirmationForm={confirmationForm}
                        />
                        <div className="text-right">
                            <Button type="button" color="success" disabled={disableProceed} onClick={() => updateRequestStatus(operation)}>Proceed</Button>
                            {'   '}
                            <Button type="button" color="danger" onClick={closeConfirmationModal}>Close</Button>
                        </div>
                    </ModalWindow>}

                {showCloneModal &&
                    <Drawer title="Clone Deployment Request" onClose={onClickClose} loading={loading} error={error} >
                        <CloneDetails
                            details={details}
                            applicationConfig={applicationConfig}
                            formRef={formRef}
                        />
                        <div className="text-right" >
                            <Button type="button" color="success" onClick={createClone} > Clone </Button>
                            {'   '}
                            <Button type="button" color="danger" onClick={onClickClose} > Close </Button>
                        </div>
                    </Drawer>}
            </BoxBody>
        </Box>
    )
}

const getOperationMessage = (status) => {
    const messageMap = {
        "approved": "Approval",
        "rejected": "Rejection",
        "hold": "Hold",
        "in_progress": "In progress",
        "deployed": "Deployment",
        "smoke_tested": "Smoke Testing"
    }
    return messageMap[status];
}

const Details = (props) => {
    const { details = {} } = props;
    const {
        status, application, requestId, repositoryLink,
        approvedBy, approvedAt, createdBy, createdAt, deployedBy, deployedAt,
        presentOwner, smokeTestedBy, smokeTestedAt,
        description = "", serviceRequested = "", environment = "",
        toBeApprovedBy, toBeDeployedBy, toBeSmokeTestedBy
    } = details || {};
    const releaseNotes = description.split('/n');

    return (
        <>
            <Row>
                <Col md="7">
                    <h3 className="text-uppercase">
                        <span className="text-regular">Devops Infra Request<br />
                            <small style={{ "verticalAlign": "33%" }}>
                                <span className="text-uppercase font-weight px-1 border rounded text-nowrap">
                                    <i className="fa fa-hdd-o" aria-hidden="true"></i> {`${application}/${status}`}
                                </span>
                            </small>
                            <small style={{ "verticalAlign": "50%" }}></small>
                        </span>
                    </h3>
                    <div className="mb-1">Environment : <b>{startCase(environment)}</b></div>
                    <div className="mb-1">Application : <b>{startCase(application)}</b></div>
                    <div className="mb-1">Deployment Request : <b>{requestId}</b></div>
                    <div className="mb-1">Service Requested : <b>{startCase(serviceRequested)}</b></div>
                    <div className="mb-1">Repo PR Link :
                        <a className="text-info" href={repositoryLink} target="_blank">{repositoryLink}</a>
                    </div>
                    <div className="mb-1">Pending with : <b>{smokeTestedAt ? "N/A" : presentOwner}</b></div>
                    <hr />
                    <div className="mb-1">To Be Approved By : <b>{toBeApprovedBy || "N/A"}</b></div>
                    <div className="mb-1">To Be Deployed By : <b>{toBeDeployedBy || "N/A"}</b></div>
                    <div className="mb-1">To Be Smoke Tested By : <b>{toBeSmokeTestedBy || "N/A"}</b></div>
                    <hr />
                    <Row>
                        <Col md="6">
                            <div className="mb-1">Requested By : <span className="text-dark">{createdBy}</span></div>
                            <div className="mb-1">Approved By : <span className="text-dark">{(approvedAt ? approvedBy : "N/A")}</span></div>
                            <div className="mb-1">Deployed By : <span className="text-dark">{deployedAt ? deployedBy : "N/A"}</span></div>
                            <div className="mb-0">Smoke Tested By : <span className="text-dark">{smokeTestedAt ? smokeTestedBy : "N/A"}</span></div>
                        </Col>
                        <Col md="6">
                            <div className="mb-1">Requested At : <span className="text-dark">{moment(createdAt).format('LLL')}</span></div>
                            <div className="mb-1">Approved At : <span className="text-dark">{approvedAt ? moment(approvedAt).format('LLL') : "N/A"}</span></div>
                            <div className="mb-1">Deployed At : <span className="text-dark">{deployedAt ? moment(deployedAt).format('LLL') : "N/A"}</span></div>
                            <div className="mb-0">Smoke Tested At : <span className="text-dark">{smokeTestedAt ? moment(smokeTestedAt).format('LLL') : "N/A"}</span></div>
                        </Col>
                    </Row>
                    <hr />
                    <div className="mt-3">
                        <h4 className="text-uppercase text-info text-underline"> Release Notes</h4>
                        <ul>
                            {releaseNotes.map((note, idx) => {
                                return <li key={idx}>{note}</li>
                            })}
                        </ul>
                    </div>
                </Col>
                <Col md="5">
                    <StatusTimelineDrawer
                        actionDetails={details} />
                </Col>
            </Row >
        </>
    );
}

const CloneDetails = (props) => {
    const { details, applicationConfig, formRef } = props;
    const { application, team, serviceRequested = "", environment = "", toBeApprovedBy, toBeDeployedBy, toBeSmokeTestedBy } = details || {};

    const validateValues = (formValues) => {
        let validationErrors = {};

        if (!isValidHttpUrl(get(formValues, 'repositoryLink'))) {
            validationErrors['repositoryLink'] = 'Please enter a valid url.';
        }
        return validationErrors;
    }

    const getCloneFields = () => {
        let fields = [{
            type: 'text',
            label: 'Environment',
            name: "environment",
            required: true,
            disabled: true
        }, {
            type: 'text',
            label: 'Team',
            name: "team",
            required: true,
            disabled: true
        }, {
            type: 'text',
            label: 'Application',
            name: "application",
            required: true,
            disabled: true
        }, {
            type: 'text',
            label: 'Requesting For Service',
            name: "serviceRequested",
            required: true,
            disabled: true
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
        }, {
            type: 'readonlytext',
            label: 'To be Approved By',
            name: "lead",
        }, {
            type: 'readonlytext',
            label: 'To be Deployed By',
            name: "devops",
        }, {
            type: 'readonlytext',
            label: 'To be Smoke Tested By',
            name: "qa",
        }];

        return fields;
    }

    return (
        <>
            <FormBuilder
                ref={formRef}
                fields={getCloneFields()}
                initialValues={{
                    environment: environment,
                    team: team,
                    application: application,
                    serviceRequested: startCase(serviceRequested),
                    lead: get(applicationConfig.serviceApproverDetails || {}, serviceRequested),
                    devops: get(applicationConfig, 'devopsEmail'),
                    qa: get(applicationConfig, 'qaEmail')
                }}
                validateValues={validateValues}
            />
        </>
    );
}

const ConfirmationForm = (props) => {
    const { details = {}, onChangeCheckList, operation, confirmationForm } = props;
    const checkListArray = getOperationChecklist(operation) || [];
    let fields = [{
        type: 'textarea',
        name: 'remark',
        label: 'Remark',
        required: true
    }];

    if (operation === "smoke_tested") {
        fields.push({
            type: 'select',
            name: 'smokeTestedStatus',
            label: 'Smoke Tested Status',
            options: [{ label: 'Passed', value: 'passed' }, { label: 'failed', value: 'failed' }],
            required: true
        });
    }

    return <>
        {checkListArray.map((point, idx) => {
            return (
                <CustomInput
                    className="my-2"
                    key={`point_${idx + 1}`}
                    type="checkbox"
                    id={`point_${idx + 1}`}
                    onChange={onChangeCheckList}
                    label={<div>{point}</div>}
                    name={`point_${idx + 1}`}
                />
            )
        })}
        <FormBuilder
            ref={confirmationForm}
            fields={fields}
        />
    </>
}

export default DeploymentRequestDetails;