import React, { Component, Fragment } from 'react'

import TabBuilder from 'modules/core/components/TabBuilder';
import { Page, PageHeader, PageBody } from 'components/page';
import { Box, BoxHeader, BoxBody } from 'components/box';
import JobDefinitionList from './JobDefinitionList';
import JobQueueList from './JobQueueList';
import ComputeEnvironmentList from './ComputeEvironmentList';

const JobList = () => {
    const tabs = [{
        icon: "bjs-job-definitions1",
        title: 'Job Definitions',
        component: <JobDefinitionList />
    }, {
        icon: "bjs-job-queue",
        title: 'Job Queues',
        component: <JobQueueList />
    }, {
        icon: "bjs-compute-environment",
        title: 'Compute Environments',
        component: <ComputeEnvironmentList />
    }];

    return (
        <Box>
            <BoxHeader heading="Batch Dashboard" />
            <BoxBody>
                <TabBuilder tabs={tabs} />
            </BoxBody>
        </Box>
    )
}

export default JobList
