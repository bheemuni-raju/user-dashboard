import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { Spin } from 'antd';
import { startCase } from 'lodash';
import moment from 'moment';

import TabBuilder from 'modules/core/components/TabBuilder';
import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import { callApi } from 'store/middleware/api';
import { FormBuilder } from 'components/form';

import AttendanceList from './attendance/AttendanceList';
import WorkflowList from './workflow/WorkflowList';
import Summary from './dashboard/Summary';
import Timeline from './dashboard/Timeline';

export const Dashboard = () => {
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    getWfhSummary();
  }, []);

  useEffect(() => {
    getWfhSummary();
  }, [date]);

  const getWfhSummary = () => {
    setLoading(true);
    callApi(`/usermanagement/wfhattendance/summary?date=${date}&&action=GET_SUMMARY_BY_DATE`, 'POST', {}, null, null, true)
      .then((response) => {
        setLoading(false);
        setSummaryData(response.docs);
      })
      .catch(error => {
        setLoading(false);
      })
  }

  const onChangeDate = (value, name) => {
    setDate(value);
  }

  const currentDateData = summaryData[0];
  return (
    <Spin spinning={loading} tip="Loading Summary">
      <BoxBody>
        <Row>
          <Col><h3> Attendance Summary : {moment(date).format('DD-MM-YYYY')} </h3></Col>
          <Col>
            <div style={{ position: 'relative', left: '70%' }}>
              <FormBuilder
                fields={[{
                  type: 'date',
                  name: 'date',
                  onChange: onChangeDate
                }]}
                cols={4}
                initialValues={{ date }}
              />
            </div>
          </Col>
        </Row>
        {currentDateData &&
          <>
            <Row>
              {Object.keys(currentDateData).map((key, idx) => {
                if (!["date", "_id"].includes(key)) {
                  const colorMap = ["success", "info", "danger", "warning", "danger", "success", "info", "warning", "success", "info"];
                  return (
                    <Col md={12 / 6} key={idx}>
                      <Card style={{ maxHeight: '70%' }}>
                        <CardHeader style={{ height: '100px' }}>{startCase(key)}</CardHeader>
                        <CardBody>
                          <p style={{ textAlign: "center", fontSize: "40px" }}>{currentDateData[key]}</p>
                        </CardBody>
                      </Card>
                    </Col>
                  )
                }
                else {
                  return (<div key={key} />);
                }
              })}
            </Row>
          </>
        }
        <Row>
          <Col md="4">
            <h3> Attendance Workflow </h3>
            <Timeline date={date} />
          </Col>
          <Col md="8">
            <h3> Manager Defaulters </h3>
            <ManagerTable date={date} />
          </Col>
        </Row>
      </BoxBody >
    </Spin>
  )
}

const ManagerTable = (props) => {
  const [date, setDate] = useState(props.date);
  const columns = [{
    dataField: '_id',
    text: 'Reporting Manager',
    quickFilter: true,
    formatter: (cell, row) => {
      return row._id.reportingManagerEmailId
    }
  }, {
    dataField: 'total',
    text: 'Total'
  }, {
    dataField: 'meetingYetToBeMarked',
    text: 'Yet to be Marked'
  }, {
    dataField: 'meetingMarked',
    text: 'Marked'
  }, {
    dataField: 'meetingNotMarked',
    text: 'Not Marked'
  }, {
    dataField: 'talktimeYetToBeUploaded',
    text: 'Yet to be Uploaded'
  }]

  useEffect(() => {
    setDate(props.date)
  }, [props.date])

  return (
    <ByjusGrid
      gridDataUrl={`/usermanagement/wfhattendance/summary?date=${date}&&action=GET_SUMMARY_BY_DEFAULTERS`}
      columns={columns}
      sort={{ meetingYetToBeMarked: -1 }}
    />
  );
}

const AttendanceDashboard = (props) => {
  const tabs = [{
    icon: "bjs-dashboard",
    title: "Dashboard",
    component: <Dashboard />
  }, {
    icon: "bjs-wfh-attendance-01",
    title: "WFH Attendance",
    component: <AttendanceList />
  }, {
    icon: "bjs-wfh-attendance-workflow-01",
    title: "WFH Attendance Workflow",
    component: <WorkflowList />
  }, {
    icon: "bjs-summary",
    title: "Summary",
    component: <Summary />
  }];

  return (
    <Box>
      <BoxHeader heading="WFH Attendance Dashboard" />
      <BoxBody>
        <TabBuilder tabs={tabs} />
      </BoxBody>
    </Box>
  )
}

export default AttendanceDashboard;
