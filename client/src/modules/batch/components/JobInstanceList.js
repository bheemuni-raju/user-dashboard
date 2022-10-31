import React from 'react';
import { Link } from 'react-router-dom';
import { get, find } from 'lodash';
import moment from 'moment';

import { Box, BoxBody, BoxHeader } from 'components/box';
import TabBuilder from 'modules/core/components/TabBuilder';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';

const JobInstanceList = () => {
  const columns = [{
    dataField: "_id",
    text: "Id",
    filterType: "TEXT",
    hidden: true
  }, {
    dataField: "jobId",
    text: "Job Id",
    filterType: "TEXT",
    width: "250",
    formatter: (cell, row) => {
      const jobId = cell;
      const status = get(row, 'status');
      return (<Link to={`instances/view/${jobId}`}>{jobId}</Link>);
    }
  }, {
    dataField: "jobName",
    text: "Job Name",
    filterType: "TEXT",
    quickFilter: true
  }, {
    dataField: "jobStatus",
    text: "Job Status",
    filterType: "TEXT"
  }, {
    dataField: "jobDefinition",
    text: "Job Definition",
    filterType: "TEXT"
  }, {
    dataField: "jobParams",
    text: "Scheduled By",
    filterType: "TEXT",
    formatter: (cell) => {
      const scheduledParam = find(cell, { name: "SCHEDULED_BY" }) || {};

      return get(scheduledParam, 'value', 'system');
    }
  }, {
    dataField: "appCategory",
    text: "App Category"
  }, {
    dataField: "moduleCategory",
    text: "Module Category",
  }, {
    dataField: "createdAt",
    text: "Created At",
    filterType: "TEXT",
    formatter: (cell) => {
      return moment(cell).format('LLL');
    }
  }, {
    dataField: "updatedAt",
    text: "Updated At",
    filterType: "TEXT",
    formatter: (cell) => {
      return moment(cell).format('LLL');
    }
  }];

  const tabs = [{
    title: "Reports History",
    component: <ByjusGrid
      columns={columns}
      gridDataUrl="/batchmanagement/job/list"
      contextCriterias={[{
        selectedColumn: "jobDefinition",
        selectedOperator: "in",
        selectedValue: ["export-job", "uat-export-job"]
      }, {
        selectedColumn: "appCategory",
        selectedOperator: "in",
        selectedValue: ["ums"]
      }]}
      modelName="Job"
      sort={{ "createdAt": -1 }}
    />
  }, {
    title: "Uploads History",
    component: <ByjusGrid
      columns={columns}
      gridDataUrl="/batchmanagement/job/list"
      contextCriterias={[{
        selectedColumn: "jobDefinition",
        selectedOperator: "in",
        selectedValue: ["upload-job", "uat-upload-job"]
      }, {
        selectedColumn: "appCategory",
        selectedOperator: "in",
        selectedValue: ["ums"]
      }]}
      modelName="Job"
      sort={{ "createdAt": -1 }}
    />
  }, {
    title: "System Jobs History",
    component: <ByjusGrid
      columns={columns}
      gridDataUrl="/batchmanagement/job/list"
      contextCriterias={[{
        selectedColumn: "jobDefinition",
        selectedOperator: "not_in",
        selectedValue: ["export-job", "upload-job", "uat-upload-job", "uat-export-job"]
      }]}
      modelName="Job"
      sort={{ "createdAt": -1 }}
    />
  }]

  return (
    <Box>
      <BoxHeader heading="Job Instances" />
      <BoxBody>
        <TabBuilder tabs={tabs} />
      </BoxBody>
    </Box>
  )
}

export default JobInstanceList;
