import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap';

import { callApi } from 'store/middleware/api';
import ByjusComboBox from 'modules/core/components/combobox/ByjusComboBox';
import DateRangePicker from 'components/DateRangePickerV2';

import DeploymentRequestStats from './Stats';
import DetailedView from './DetailedView';
import Overview from './Overview';
import CalendarHeatMap from './CalendarHeatMap';

const DeploymentRequestDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [dateRange, setDateRange] = useState({ start: moment().add(-7, "days").add(330, 'minutes'), end: moment().add(6, "days").add(331, 'minutes') });
    const [team, setTeam] = useState("all");
    const [groupBy, setGroupBy] = useState("created_at");
    const [graphData, setGraphData] = useState([]);
    const [statsData, setStatsData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [calendarData, setCalendarData] = useState([]);

    useEffect(() => {
        if (!isEmpty(dateRange) || groupBy || team) {
            getDevopsRequestOverview();
        }
    }, [dateRange, groupBy, team])

    async function getDevopsRequestOverview() {
        const url = "/usermanagement/analyticsmanagement/deploymentrequest/getDevopsInfraRequestOverview";
        setLoading(true);
        callApi(url, 'POST', {
            startDate: dateRange.start,
            endDate: dateRange.end,
            groupBy,
            team
        }, null, null, true)
            .then(res => {
                setGraphData(res.graphData);
                setStatsData(res.statsData);
                setTableData(res.tableData);
                setCalendarData(res.calendarData);
                setLoading(false);
                setIsLoaded(true);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
                setIsLoaded(false);
            })
    }

    function onChangeDateRange(start, end) {
        setDateRange({ start, end });
    }

    function onChangeTeam(name, value) {
        setTeam(value && value.value);
    }

    function onChangeGroupBy(name, value) {
        setGroupBy(value && value.value);
    }

    return (
        <Spin spinning={loading} tip="Loading">
            <DeploymentRequestStats statsData={statsData} />
            <div className="row">
                <div className="col-md-12">
                    <div className="pull-right" style={{ marginRight: 80, width: 150 }}>
                        <ByjusComboBox
                            name='team'
                            placeholder='Select Team'
                            value={team}
                            options={[{
                                label: 'All',
                                value: 'all'
                            }, {
                                label: 'Upstream',
                                value: 'upstream'
                            }, {
                                label: 'Downstream',
                                value: 'downstream'
                            }, {
                                label: 'Credit Process',
                                value: 'credit_process'
                            }]}
                            customStyles={{
                                width: 100
                            }}
                            onChange={onChangeTeam}
                        />
                    </div>
                    <div className="pull-right" style={{ marginRight: 10, width: 150 }}>
                        <ByjusComboBox
                            name='groupBy'
                            value={groupBy}
                            placeholder="Group By"
                            options={[
                                { label: 'Application', value: 'application' },
                                { label: 'Service Requested', value: 'service_requested' },
                                { label: 'Created At', value: 'created_at' },
                                { label: 'Created By', value: 'created_by' },
                                { label: 'Approved By', value: 'approved_by' },
                                { label: 'Deployed By', value: 'deployed_by' },
                                { label: 'Smoke Tested By', value: 'smoke_tested_by' }
                            ]}
                            customStyles={{
                                width: 200
                            }}
                            onChange={onChangeGroupBy}
                        />
                    </div>
                    <div className="pull-right" style={{ marginRight: 10 }}>
                        <DateRangePicker onChangeDateRange={onChangeDateRange} />
                    </div>
                </div>
            </div><br />

            <Row>
                <Col>
                    <Card>
                        <CardHeader>
                            <span className="text-uppercase">Deployment Request Overview</span>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col md="7">
                                    {isLoaded && <DetailedView graphData={graphData} pieChartData={tableData} groupBy={groupBy} />}
                                </Col>
                                <Col md="5">
                                    {isLoaded && <Overview tableData={tableData} dateRange={dateRange} groupBy={groupBy} />}
                                </Col>
                            </Row>
                            <Row>
                                <div style={{ width: "600px", marginLeft: "40px", height: "300px" }
                                }>
                                    <CalendarHeatMap dateRange={dateRange} calendarData={calendarData} />

                                </div>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Spin>
    )
}

export default DeploymentRequestDashboard;