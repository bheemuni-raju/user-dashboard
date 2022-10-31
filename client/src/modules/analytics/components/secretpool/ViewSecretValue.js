import React, { Fragment } from 'react'
import { withRouter } from 'react-router';

import { FieldGroup } from 'components/form'
import { Page, PageBody, } from 'components/page'
import { Box, BoxBody } from 'components/box'

const ViewSecretValue = (props) => {

    const { templateData } = props;

    const getTemplateDetails = (templateData) => {
        console.log("templateData.value", templateData.value);
        return (
            <Fragment>
                <FieldGroup
                    name="value"
                    type="readonlytext"
                    label="Secret Value:"
                    value={templateData.value}
                    inline={true} />
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
