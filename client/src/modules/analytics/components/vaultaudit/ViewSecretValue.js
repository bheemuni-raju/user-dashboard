import React, { Fragment } from 'react'
import { withRouter } from 'react-router';

import { FieldGroup } from 'components/form'
import { Page, PageBody, } from 'components/page'
import { Box, BoxBody } from 'components/box'

const ViewSecretValue = (props) => {

    const { templateData } = props;

    const getTemplateDetails = (templateData) => {
        return (
            <Fragment>
                <FieldGroup
                    name="Previous Value"
                    type="readonlytext"
                    label="Previous Value:"
                    value={templateData.previousValue}
                    inline={true}
                />

                <FieldGroup
                    name="Current Value"
                    type="readonlytext"
                    label="Current Value:"
                    value={templateData.currentValue}
                    inline={true}
                />
            </Fragment>
        )
    }

    return (
        <Page>
            <PageBody>
                <Box type="warning">
                    <BoxBody>
                        {templateData && getTemplateDetails(templateData)}
                    </BoxBody>
                </Box>
            </PageBody>
        </Page>
    )
}

export default withRouter(ViewSecretValue)
