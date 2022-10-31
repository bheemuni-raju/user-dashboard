import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router';
import lodash from 'lodash'
import { Col, Row } from 'reactstrap'

import { FieldGroup } from 'components/form'
import { Page, PageBody, } from 'components/page'
import { Box, BoxBody } from 'components/box'

import '../appRole.scss'

const AppRoleView = (props) => {

    const { templateData } = props;

    const getTemplateDetails = (templateData) => {
        return (
            <Fragment>
                <FieldGroup
                    name="appRoleName"
                    type="readonlytext"
                    label="Application Role :"
                    value={templateData.name}
                    inline={true} />

                <FieldGroup
                    name="appName"
                    type="readonlytext"
                    label="Application Name :"
                    value="UMS"
                    inline={true} />
            </Fragment>
        )
    }

    const getPermissions = (permissions) => {
        const totalPermissions = permissions.length
        const rows = lodash.chunk(permissions, Math.ceil(totalPermissions / 2))

        return (<Row>
            {rows.map((col, index) => {
                return (<Col md={6} key={index}>
                    <ul>
                        {col.map((permission, index) => {
                            return (<li key={index}>{permission}</li>)
                        })}
                    </ul>
                </Col>)
            })
            }
        </Row>)
    }

    return (
        <Page>
            <PageBody>
                <Box type="warning">
                    <BoxBody>
                        {templateData && getTemplateDetails(templateData)}
                    </BoxBody>
                </Box>
                <div className="propertiesInput">
                    <strong className="propertiesInput-label">Permissions :</strong>
                </div>
                <Box type="warning" style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <BoxBody >
                        {getPermissions(templateData.permissions)}
                    </BoxBody>
                </Box>
            </PageBody>
        </Page>
    )
}

export default withRouter(AppRoleView)
