import React, { Component } from 'react';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';

const ComputeEnvironmentList = () => {
    const columns = [{
        text: 'Compute Env Name',
        dataField: 'computeEnvironmentName',
        width: 100
    }, {
        text: 'EC2 Name',
        dataField: 'computeResources.tags.Name',
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
        text: 'Type',
        dataField: 'type'
    }];

    return (
        <ByjusGrid
            columns={columns}
            modelName="JobDefinition"
            gridDataUrl="/batchmanagement/computeenv/list"
        />
    );
}

export default ComputeEnvironmentList;
