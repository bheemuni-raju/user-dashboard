import React from 'react';
import { Box, BoxBody } from 'components/box';
import { NavLink, Collapse, Badge, Row, Col, Container, Button } from 'reactstrap'
import { get } from 'lodash';

function SmsTransactionsTab(props) {
    const { smsTransactionsData = [], smsTemplateData = {} } = props;
    const navStyle = { fontWeight: "bold", color: "#075D92" };

    const getSmsTransactionsDetails = () => {
        let templateId = get(smsTemplateData, 'templateId', '');
        let totalTransactions = smsTransactionsData;
        let successTransactions = smsTransactionsData.filter(x => x.status === "success");
        let failedTransactions = smsTransactionsData.filter(x => x.status === 'failure');
        let pendingTransactions = smsTransactionsData.filter(x => x.status === 'pending');

        return (
            <>
                <NavLink style={navStyle}>Sms Transactions Details</NavLink>
                <br />
                <Collapse isOpen={true}>
                    <Container>
                        <Row>
                            <Col> <b>Template Id :</b> {templateId}</Col>
                        </Row>
                        <br />
                        <Row>
                            <Col><b> Total Transactions: </b> {totalTransactions.length}</Col>
                        </Row>
                        <br />
                        <Row>
                            <Col> <b> No of Successful Transactions : </b> {successTransactions.length}</Col>
                        </Row>
                        <br />
                        <Row>
                            <Col> <b> No of Pending Transactions: </b> {pendingTransactions.length}</Col>
                        </Row>
                        <br />
                        <Row>
                            <Col> <b> No of Failed Transactions: </b> {failedTransactions.length}</Col>
                        </Row>
                    </Container>
                </Collapse>
            </>
        )
    }

    return (
        <>
            {getSmsTransactionsDetails()}
        </>
    )
}

export default SmsTransactionsTab;