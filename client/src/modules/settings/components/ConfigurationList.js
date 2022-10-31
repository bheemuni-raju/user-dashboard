import React, { Fragment } from 'react';
import { Button } from 'antd';
import { connect } from 'react-redux';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';
import ConfigurationForm from './ConfigurationForm';
import ConfigurationView from './ConfigurationView';
import { callApi } from 'store/middleware/api';
import get from 'lodash/get';

import '../scss/index.scss';
import { Box, BoxBody } from 'components/box';

const MODAL = {
    VIEW: 'view',
    EDIT: 'edit',
    NONE: ''
}
class ConfigurationList extends React.Component {
    state = {
        openedModal: '',
        loading: false
    }

    showDrawer = (rowData, modal) => {
        this.setState({ openedModal: modal, rowData });
    }

    onSave = (configs, rowData) => {
        const { user } = this.props;
        const { formattedAppName, formattedModuleName } = rowData;
        const updatedBy = get(user, 'email')
        this.setState({ loading: true });
        const request = { formattedAppName, formattedModuleName, configs, updatedBy };
        callApi(`/byjusconfig/editConfig`, 'POST', request, null, null, true)
            .then(response => {
                this.setState({ loading: false });
            })
            .catch(error => {
                this.setState({ loading: false });
            });

        this.setState({ openedModal: MODAL.NONE });
    }

    onClose = () => {
        this.setState({ openedModal: MODAL.NONE });
    }

    render() {
        const extraColumns = [{
            dataField: '_id',
            text: 'Actions',
            width: '100px',
            position: 2,
            formatter: (cell, row) => {
                return (
                    <div>
                        <Button type="primary" size="small" className="mr-1" onClick={() => this.showDrawer(row, MODAL.VIEW)}>
                            <i className="fa fa-eye" />
                        </Button>
                    </div>
                );
            }
        }];
        const { openedModal, rowData } = this.state;

        return (
            <Box>
                <BoxBody>
                    <ByjusGrid
                        ref="byjusGrid"
                        extraColumns={extraColumns}
                        modelName="ByjusConfig"
                        gridId="byjus_config_base_grid"
                        gridDataUrl={`/byjusconfig/list`}
                        sort={{ updatedAt: 'desc' }}
                    />
                    <ConfigurationView
                        visible={openedModal === MODAL.VIEW}
                        onSave={this.onSave}
                        onClose={this.onClose}
                        rowData={rowData}
                    />

                    <ConfigurationForm
                        visible={openedModal === MODAL.EDIT}
                        onSave={this.onSave}
                        onClose={this.onClose}
                        rowData={rowData}
                    />
                </BoxBody>
            </Box>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
})

export default connect(mapStateToProps)(ConfigurationList);