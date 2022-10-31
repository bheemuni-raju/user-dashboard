import React, { Fragment } from 'react'
import { withRouter } from 'react-router';
import lodash from 'lodash'
import { Col, Row } from 'reactstrap'

import { FieldGroup } from 'components/form'
import { Page, PageBody, } from 'components/page'
import { Box, BoxBody } from 'components/box'

const AppGroupMappingView = (props) => {

    const { templateData } = props;

    const getTemplateDetails = (templateData) => {
        return (
            <Fragment>
                <FieldGroup
                    name="vaultUuid"
                    type="readonlytext"
                    label="Vault Uid:"
                    value={templateData.vaultMapping.vaultUuid}
                    inline={true} />

            </Fragment>
        )
    }

    const getAppGroupMapping = (mappingData) => {
        const totalMapping = mappingData.length
        const rows = lodash.chunk(mappingData, Math.ceil(totalMapping / 2))

        return (<Row>
            {rows.map((col, index) => {
                return (<Col md={6} key={index}>
                    <ul>
                        {col.map((appGroup, index) => {
                                return (<li key={index}>{appGroup.name}</li>)
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
                    <strong className="propertiesInput-label">User Groups :</strong>
                </div>
                <Box type="warning" style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <BoxBody >
                        {getAppGroupMapping(templateData.vaultAppGroupMapping)}
                    </BoxBody>
                </Box>
            </PageBody>
        </Page>
    )
}

export default withRouter(AppGroupMappingView)
