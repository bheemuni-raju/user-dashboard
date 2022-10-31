import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

import { Box, BoxHeader, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';
import GridJsonConfig from '../components/GridJsonConfig';

class CreateGridTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templateData: null
        }
    }

    onClickSave = async (templateData) => {
        const payload = {
            templateData
        };

        try {
            this.setState({ loading: true });
            await callApi(`/support/gridtemplate`, "POST", payload, null, null, true)
                .then((response) => {
                    this.setState({ loading: false, error: null });
                    this.props.history.goBack();
                })
                .catch((error) => {
                    this.setState({ loading: false, error });
                });
        }
        catch (e) {
            this.setState({ error: "Create grid template api failed!", loading: false });
        }
    }

    render = () => {
        const { templateData, loading, error } = this.state;

        return (
            <Box>
                <BoxHeader heading="Add Grid Templates" />
                <BoxBody loading={loading} error={error}>
                    <Row>
                        <Col md={8}>
                            <GridJsonConfig
                                templateData={templateData}
                                onClickSave={this.onClickSave}
                            />
                        </Col>
                    </Row>
                </BoxBody>
            </Box>
        )
    }
}

export default CreateGridTemplate;
