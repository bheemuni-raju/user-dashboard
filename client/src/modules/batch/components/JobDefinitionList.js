import React, { useState } from 'react';
import { Button } from 'reactstrap';
import Notify from 'react-s-alert';
import { connect } from 'react-redux';
import { Spin, Alert, Drawer } from 'antd';
import { get } from 'lodash';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';
import { callApi } from 'store/middleware/api';
import { FormBuilder } from 'components/form';
import { Box, BoxBody } from 'components/box';

const { batch } = require('lib/permissionList');

const JobDefinitionList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitionloading, setSubmitionloading] = useState(false);
    const [jobData, setJobData] = useState({});
    const [jobQueues, setJobQueues] = useState([]);
    const [showDrawer, setShowDrawer] = useState(false);
    //  let byjusGridRef = "", 
    let submitFormRef = "";

    const buildToolbarItems = () => {
        return (
            <Button onClick={onClickSyncWithAws} color="warning"> Sync with AWS</Button>
        );
    }

    const onClickSyncWithAws = () => {
        setLoading(true);
        try {
            callApi(`/batchmanagement/jobdefinition/syncWithAws`, 'POST', {}, null, null, true)
                .then((response) => {
                    setLoading(false);
                    Notify.success("Synced successfully.", {position: "bottom", timeout: 2000});
                    //byjusGridRef && byjusGridRef.onClickRefresh();
                })
                .catch(error => {
                    setLoading(false);
                    setError(error);
                })
        }
        catch (error) {
            setLoading(false);
            setError(error);
            Notify.success("Error while fetching Job queues.");
        }
    }

    const onClickSubmitJob = () => {
        const formValues = submitFormRef && submitFormRef.validateFormAndGetValues();

        if (formValues) {
            setSubmitionloading(true);
            setError(null);
            const payload = {
                jobName: formValues.jobName && formValues.jobName.replace(/ /g, ''),
                jobQueue: formValues.jobQueue,
                jobDefinitionName: formValues.jobDefinitionName,
                jobDefinitionArn: formValues.jobDefinitionArn,
                environment: get(jobData, 'containerProperties.environment', [])
            }
            try {
                callApi(`/batchmanagement/job/submitJob`, 'POST', payload, null, null, true)
                    .then((response) => {
                        setSubmitionloading(false);
                        closeDrawer();
                    })
                    .catch(error => {
                        setSubmitionloading(false);
                        setError(error);
                    })
            }
            catch (error) {
                setSubmitionloading(false);
                setError(error);
                Notify.success("Error while fetching Job queues.");
            }
        }
    }

    const getJobQueues = async () => {
        setSubmitionloading(false);
        setError(null);
        try {
            await callApi(`/batchmanagement/jobqueue/list`, 'POST', {}, null, null, true)
                .then((response) => {
                    setSubmitionloading(false);
                    setJobQueues(response.docs);
                })
                .catch(error => {
                    setSubmitionloading(false);
                    setError(error);
                })
        }
        catch (error) {
            setSubmitionloading(false);
            setError(error);
            Notify.success("Error while fetching Job queues.");
        }
    }

    const onClickSubmit = (cell, row) => {
        getJobQueues();
        setJobData(row);
        setShowDrawer(true);
    }

    const closeDrawer = () => {
        setShowDrawer(false);
    }

    const getSubmitForm = (jobData) => {
        const { containerProperties } = jobData;
        const { environment, image } = containerProperties || {};

        const jobQueueArray = jobQueues.map(q => { return { label: q.jobQueueName, value: q.jobQueueName } });
        let fields = [{
            type: 'text',
            name: 'jobName',
            label: 'Job Definition Name',
            required: true
        }, {
            type: 'select',
            options: jobQueueArray,
            name: 'jobQueue',
            label: 'Job Queue',
            required: true
        }, {
            type: 'text',
            name: 'jobDefinitionName',
            label: 'Job Definition Name',
            disabled: true,
            required: true
        }, {
            type: 'text',
            name: 'jobDefinitionArn',
            disabled: true,
            label: 'Job Definition ARN'
        }, {
            type: 'text',
            name: 'image',
            disabled: true,
            label: 'ECR Image'
        }, {
            type: 'text',
            name: 'revision',
            disabled: true,
            label: 'Revision'
        }];

        // environment.map((env) => {
        //     fields.push({
        //         type: 'readonlytext',
        //         name: env.name,
        //         label: `Env : ${env.name}`
        //     })
        // })

        let environmentMap = {};
        environment && environment.map(env => environmentMap[env.name] = env.value);
        return (<>
            <FormBuilder
                ref={(element) => submitFormRef = element}
                fields={fields}
                initialValues={{
                    ...jobData,
                    ...containerProperties,
                    ...environmentMap
                }}
            />
            <div className="text-right">
                <Button onClick={onClickSubmitJob} color="success"> Submit Job</Button>{' '}
                <Button onClick={closeDrawer} color="danger"> Close</Button>
            </div>
        </>);
    }

    const buildDrawer = (jobData) => {
        return (
            <Drawer
                title="Submit Job"
                width={720}
                onClose={closeDrawer}
                visible={true}>
                <Spin spinning={submitionloading}>
                    {error && <Alert message={error} type="error"></Alert>}
                    {getSubmitForm(jobData)}
                </Spin>
            </Drawer>
        )
    }

    const columns = [{
        text: 'Job Definitions',
        dataField: 'jobDefinitionName',
        quickFilter: true
    }, {
        text: 'Revision',
        dataField: 'revision',
        sort: true
    }, {
        text: 'Actions',
        dataField: 'actions',
        sort: false,
        formatter: (cell, row) => {
            const { user } = props;
            const isAuthorized = user && user.permissions && user.permissions.includes(batch.submitJob);
            return (
                isAuthorized ? <>
                    <Button color="success" size="sm" onClick={() => onClickSubmit(cell, row)}>
                        <i className="fa fa-forward" /> Submit
                    </Button>
                </> :
                    <div style={{ color: 'red' }}>Un-authorized</div>
            );
        }
    }];

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    //ref={(element) => byjusGridRef = element}
                    columns={columns}
                    modelName="JobDefinition"
                    gridDataUrl="/batchmanagement/jobdefinition/list"
                    toolbarItems={buildToolbarItems()}
                    sort={{ jobDefinitionName: 1 }}
                />
                {showDrawer && buildDrawer(jobData)}
            </BoxBody>
        </Box>
    )
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(JobDefinitionList);
