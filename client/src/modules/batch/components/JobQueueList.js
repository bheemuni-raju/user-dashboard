import React, { Component, Fragment } from 'react';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';

const JobQueueList = () => {
    const columns = [{
        text: 'Job Queue Name',
        dataField: 'jobQueueName',
        width: 100
    }, {
        text: 'Priority',
        dataField: 'priority',
        width: 60
    }, {
        text: 'State',
        dataField: 'state',
        width: 60
    }, {
        text: 'Status',
        dataField: 'status',
        width: 60
    }, {
        text: 'Job Queue Arn',
        dataField: 'jobQueueArn'
    }];

    return (
        <ByjusGrid
            columns={columns}
            modelName="JobDefinition"
            gridDataUrl="/batchmanagement/jobqueue/list"
        />
    );
}

export default JobQueueList
