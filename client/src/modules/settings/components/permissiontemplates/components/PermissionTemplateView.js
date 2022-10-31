import React, { Component, Fragment } from 'react'
import lodash from 'lodash'
import { Col, Row } from 'reactstrap'

import { FieldGroup } from 'components/form'
import { Page, PageBody, } from 'components/page'
import { Box, BoxBody } from 'components/box'

import '../PermissionTemplateRouter.scss'

class PermissionTemplateView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            itemProperties: null
        }
    }

    getTemplateDetails = (templateData) => {
        return (
            <Fragment>
                <FieldGroup
                    name="templateName"
                    type="readonlytext"
                    label="Name :"
                    value={templateData.name}
                    inline={true} />

                <FieldGroup
                    name="templateDescription"
                    type="readonlytext"
                    label="Description :"
                    value={templateData.description}
                    inline={true} />
            </Fragment>
        )
    }

    getPermissions = (permissions) => {
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

    componentDidMount = async () => {

    }

    render() {
        const { templateData } = this.props

        return (
            <Page>
                <PageBody>
                    <Box type="warning">
                        <BoxBody>
                            {templateData && this.getTemplateDetails(templateData)}
                        </BoxBody>
                    </Box>
                    <div className="propertiesInput">
                        <strong className="propertiesInput-label">Permissions :</strong>
                    </div>
                    <Box type="warning" style={{ maxHeight: '200px', overflow: 'auto' }}>
                        <BoxBody >
                            {this.getPermissions(templateData.permissions)}
                        </BoxBody>
                    </Box>
                </PageBody>
            </Page>
        )
    }
}

export default PermissionTemplateView
