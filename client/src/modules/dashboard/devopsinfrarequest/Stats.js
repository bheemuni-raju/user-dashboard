import React from 'react';
import { Row, Col } from 'reactstrap';

import StatsCard from '../components/StatsCard';

const Stats = (props) => {
    const statsData = props.statsData && props.statsData[0] || {};

    return (
        <>
            <Row>
                <Col className="px-1">
                    <StatsCard
                        title="Total Requests"
                        count={statsData.totalRequests}
                        gradientClr="#FF8042"
                        icon="fa fa-2x fa-line-chart"
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="Created"
                        count={statsData.createdRequests}
                        gradientClr="#FFBB28"
                        icon="fa fa-2x fa-plus"
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="Approved"
                        count={statsData.approvedRequests}
                        gradientClr="#0088FE"
                        icon="fa fa-2x fa-check"
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="In Progress"
                        count={statsData.inProgressRequests}
                        gradientClr="yellow"
                        icon="fa fa-2x fa-refresh fa-spin"
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="Deployed"
                        count={statsData.deployedRequests}
                        gradientClr="#2596BE"
                        icon="fa fa-2x fa-thumbs-up"
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="Smoke Tested"
                        count={statsData.pomsUsers}
                        gradientClr="#00C49F"
                        icon="fa fa-2x fa-laptop"
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="Rejected"
                        count={statsData.rejectedRequests}
                        gradientClr="#E91404"
                        icon="fa fa-2x fa-times"
                    />
                </Col>
            </Row>
        </>
    )
}

export default Stats;