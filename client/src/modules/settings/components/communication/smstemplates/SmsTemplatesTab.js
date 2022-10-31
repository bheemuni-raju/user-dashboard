import React from 'react';
import { NavLink, Collapse, Badge, Row, Col, Container, Button } from 'reactstrap'
import { Box, BoxBody } from 'components/box';
import { upperCase } from 'lodash';
import { smsTemplateStatusColourMap } from 'utils/componentUtil';

function SmsTemplatesTab(props) {
    const { smsTemplateData } = props;
    const navStyle = { fontWeight: "bold", color: "#075D92" };

    const getSmsTemplateDetails = () => {
        const { name = "", templateId = "", orgFormattedName = "", status = "", activeProviders = [], senderIds = [], content = "" } = smsTemplateData || {};

        return (
            <>
                <NavLink style={navStyle}>Sms Template Details</NavLink>
                <br />
                <Collapse isOpen={true}>
                    <Container>
                        <Row>
                            <Col> <b>Name :</b> {name}</Col>
                            <Col> <b>Template Id :</b> {templateId}</Col>
                            <Col>  <b>Organization :</b> {orgFormattedName}</Col>
                        </Row>
                        <br />
                        <Row>
                            <Col>  <b>Status :</b> <Badge color={smsTemplateStatusColourMap[status]}>{upperCase(status)}</Badge></Col>
                            <Col>  <b>Providers: </b>{activeProviders.join()}</Col>
                            <Col>  <b>Sender Ids: </b> {senderIds.join()}</Col>
                        </Row>
                        <br />
                        <Row>
                            <Col>  <b>Sms Content: </b> <br />{content}</Col>
                        </Row>
                    </Container>
                </Collapse>
            </>
        );
    }

    return (
        <>
            {getSmsTemplateDetails()}
        </>
    )
}

export default SmsTemplatesTab;