import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap';

import { callApi } from 'store/middleware/api';
import ByjusComboBox from 'modules/core/components/combobox/ByjusComboBox';
import DateRangePicker from 'components/DateRangePickerV2';
import UserTrend from './UserTrend';
import RoleTrend from './RoleTrend';
import UserStats from './UserStats';
import UserSummaryTable from './UserSummaryTable';
import RoleSummaryTable from './RoleSummaryTable';

const UserDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({ start: moment().add(-7, "days").add(330, 'minutes'), end: moment().add(6, "days").add(331, 'minutes') });
    const [subType, setSubType] = useState("all");
    const [groupByDate, setGroupByDate] = useState("actionDetails.createdAt");
    const [userGraphData, setUserGraphData] = useState([]);
    const [roleGraphData, setRoleGraphData] = useState([]);
    const [statsData, setStatsData] = useState([]);
    const [userTableData, setUserTableData] = useState([]);
    const [roleTableData, setRoleTableData] = useState([]);

    useEffect(() => {
        if (!isEmpty(dateRange) || !isEmpty(subType) || groupByDate) {
            console.log(JSON.stringify(dateRange));
            getUserOverview();
        }
    }, [dateRange, subType, groupByDate])

    async function getUserOverview() {
        const url = "/usermanagement/dashboard/getUserOverview";
        setLoading(true);
        callApi(url, 'POST', {
            startDate: dateRange.start,
            endDate: dateRange.end,
            groupByDate,
            subType
        }, null, null, true)
            .then(res => {
                setUserGraphData(res.userGraphData);
                setRoleGraphData(res.roleGraphData);
                setStatsData(res.statsData);
                setUserTableData(res.userTableData);
                setRoleTableData(res.roleTableData);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    function onChangeDateRange(start, end) {
        setDateRange({ start, end });
    }

    function onChangeSubType(name, value) {
        setSubType(value && value.value);
    }

    function onChangeGroupByDate(name, value) {
        setGroupByDate(value && value.value);
    }

    return (
        <Spin spinning={loading} tip="Loading">
            <UserStats statsData={statsData} />
            <div className="row">
                <div className="col-md-12">
                    <div className="pull-right" style={{ marginRight: 80, width: 150 }}>
                        <ByjusComboBox
                            name='subType'
                            placeholder='All'
                            value={subType}
                            options={[{
                                label: 'All',
                                value: 'all'
                            }, {
                                label: 'UMS',
                                value: 'ums'
                            }, {
                                label: 'IMS',
                                value: 'ims'
                            }, {
                                label: 'FMS',
                                value: 'fms'
                            }, {
                                label: 'POMS',
                                value: 'poms'
                            }, {
                                label: 'OMS',
                                value: 'oms'
                            }, {
                                label: 'LMS',
                                value: 'lms'
                            }, {
                                label: 'SOS',
                                value: 'sos'
                            }, {
                                label: 'CXMS',
                                value: 'cxms'
                            }, {
                                label: 'MOS',
                                value: 'mos'
                            }, {
                                label: 'DFOS',
                                value: 'dfos'
                            }, {
                                label: 'STMS',
                                value: 'stms'
                            }, {
                                label: "Compliance",
                                value: "compliance"
                            }]}
                            customStyles={{
                                width: 100
                            }}
                            onChange={onChangeSubType}
                        />
                    </div>
                    <div className="pull-right" style={{ marginRight: 10 }}>
                        <DateRangePicker onChangeDateRange={onChangeDateRange} />
                    </div>
                    <div className="pull-right" style={{ marginRight: 10, width: 150 }}>
                        <ByjusComboBox
                            name='groupByDate'
                            value={groupByDate}
                            options={[{
                                label: 'Created At',
                                value: 'actionDetails.createdAt'
                            }]}
                            customStyles={{
                                width: 200
                            }}
                            onChange={onChangeGroupByDate}
                        />
                    </div>
                </div>
            </div><br />

            <Row>
                <Col md={6}>
                    <Card>
                        <CardHeader>
                            <span className="text-uppercase">User Overview</span>
                        </CardHeader>
                        <CardBody>
                            <UserTrend userGraphData={userGraphData} />
                            <UserSummaryTable userTableData={userTableData} dateRange={dateRange} groupByDate={groupByDate} />
                        </CardBody>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <CardHeader>
                            <span className="text-uppercase">Role Overview</span>
                        </CardHeader>
                        <CardBody>
                            <RoleTrend roleGraphData={roleGraphData} />
                            <RoleSummaryTable roleTableData={roleTableData} dateRange={dateRange} groupByDate={groupByDate} />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Spin>
    )
}

export default UserDashboard;