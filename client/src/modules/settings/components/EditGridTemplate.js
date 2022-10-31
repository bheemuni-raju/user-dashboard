import React, { Fragment, Component } from 'react';
import { Row, Col } from 'reactstrap';

import { Box, BoxHeader, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';

import GridJsonConfig from '../components/GridJsonConfig';

class EditGridTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templateData: null
        }
    }

    componentDidMount = () => {
        const { state } = this.props.location || {};
        const { gridId, viewName } = state || {};

        if (gridId || viewName) {
            this.getGridTemplate(gridId, viewName);
        }
    }

    getGridTemplate = async (gridId, viewName) => {
        try {
            this.setState({ loading: true });
            await callApi(`/support/gridtemplate?gridId=${gridId}&viewName=${viewName}`, "GET", null, null, null, true)
                .then((response) => {
                    this.setState({ loading: false, error: null, templateData: response });
                })
                .catch((error) => {
                    this.setState({ loading: false, error });
                });
        }
        catch (error) {
            this.setState({ loading: false, error });
        }
    }

    onClickSave = async (templateData) => {
        const { state } = this.props.location || {};
        const { gridId, viewName } = state || {};

        delete templateData._id;
        try {
            this.setState({ loading: true });
            await callApi(`/support/gridtemplate`, "PUT", {
                templateData,
                gridId: gridId || templateData.gridId,
                viewName: viewName || templateData.viewName
            }, null, null, true)
                .then((response) => {
                    this.setState({ loading: false, error: null });
                    this.props.history.goBack();
                })
                .catch((error) => {
                    this.setState({ loading: false, error });
                });
        }
        catch (e) {
            this.setState({ error: "Grid config save failed!", loading: false });
        }
    }

    render = () => {
        const { templateData, loading, error } = this.state;
        const { name, description, gridId, viewName } = templateData || {};

        return (
            <Box>
                <BoxHeader heading="Edit Grid Templates" />
                <BoxBody loading={loading} error={error}>
                    <Row>
                        <Col md={6}>
                            {templateData &&
                                <div style={{ margin: '10px' }}>
                                    <p><strong>Grid Id : </strong>{gridId}</p>
                                    <p><strong>Name : </strong>{name}</p>
                                    <p><strong>Description : </strong>{description}</p>
                                    <p><strong>View Name : </strong>{viewName}</p>
                                </div>
                            }
                        </Col>
                        {templateData && <Col md={6}>
                            <GridJsonConfig
                                templateData={templateData}
                                onClickSave={this.onClickSave}
                            />
                        </Col>}
                    </Row>
                </BoxBody>
            </Box>
        )
    }
}

export default EditGridTemplate;
