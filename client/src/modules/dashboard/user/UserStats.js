import React from 'react';
import { Row, Col } from 'reactstrap';

import StatsCard from '../components/StatsCard';

import umsSygnet from '@byjus-orders/nicons/assets/favicons/byjus-ums.png';
import omsSygnet from '@byjus-orders/nicons/assets/favicons/byjus-oms.png';
import imsSygnet from '@byjus-orders/nicons/assets/favicons/byjus-ims.png';
import fmsSygnet from '@byjus-orders/nicons/assets/favicons/byjus-fms.png';
import pomsSygnet from "@byjus-orders/nicons/assets/favicons/byjus-poms.png";
import lmsSygnet from '@byjus-orders/nicons/assets/favicons/byjus-lms.png';
import sosSygnet from '@byjus-orders/nicons/assets/favicons/byjus-sos.png';
import totalSygnet from 'assets/img/brand/sygnet.svg';

const UserStats = (props) => {
    const statsData = props.statsData && props.statsData[0] || {};

    return (
        <>
            <Row>
                <Col className="px-1">
                    <StatsCard
                        title="Total"
                        count={statsData.totalUsers}
                        gradientClr="#8c12e8"
                        sygnet={totalSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="UMS"
                        count={statsData.umsUsers}
                        gradientClr="#02a8b5"
                        sygnet={umsSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="IMS"
                        count={statsData.imsUsers}
                        gradientClr="#b64e4c"
                        sygnet={imsSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="FMS"
                        count={statsData.fmsUsers}
                        gradientClr="#b68359"
                        sygnet={fmsSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="POMS"
                        count={statsData.pomsUsers}
                        gradientClr="#2c8ef8"
                        sygnet={pomsSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="LMS"
                        count={statsData.lmsUsers}
                        gradientClr="#727cf5"
                        sygnet={lmsSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="SOS"
                        count={statsData.sosUsers}
                        gradientClr="#cc7633"
                        sygnet={sosSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="OMS"
                        count={statsData.omsUsers}
                        gradientClr="#12344d"
                        sygnet={omsSygnet}
                    />
                </Col>
                <Col className="px-1">
                    <StatsCard
                        title="CXMS"
                        count={statsData.cxmsUsers}
                        gradientClr="#dc344d"
                        sygnet={omsSygnet}
                    />
                </Col>
            </Row>
        </>
    )
}

export default UserStats;