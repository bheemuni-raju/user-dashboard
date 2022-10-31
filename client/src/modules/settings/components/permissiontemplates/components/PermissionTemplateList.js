
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import { get } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box'
import { showConfirmDialog, hideDialog } from 'modules/core/reducers/dialog'
import { callApi } from 'store/middleware/api'
import ModalWindow from 'components/modalWindow'
import ConfirmationDialog from 'components/confirmationDialog'
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3'
import PermissionTemplateView from './PermissionTemplateView'
import { permissionTemplate, validatePermission } from 'lib/permissionList';

const mapDispatchToProps = dispatch => ({
    showDialog: (cancel, confirm, message) =>
        dispatch(showConfirmDialog(cancel, confirm, message, 'Delete')),
    hideDialog: () => dispatch(hideDialog())
})

class PermissionTemplateList extends Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            error: null,
            showViewModal: false,
            showCreateModal: false,
            templateData: null,
            createModalFormvalues: {},
            appScreens: []
        }
    }

    buildToolbarItems = () => {
        let { user = {} } = this.props;
        const createFlag = validatePermission(user, permissionTemplate.createPermissionTemplate);

        return (
            <Fragment>
                <Link className="btn btn-secondary btn-sm" hidden={!createFlag} to="permission-templates/create">
                    <i className="fa fa-plus"></i> {' '}Create
                </Link> {" "}
            </Fragment>
        )
    }

    onClickDelete = (cell, row) => () => {
        this.setState({
            showDeleteModal: true,
            itemData: row
        });
    }

    onCloseDeleteModal = () => {
        this.setState({ showDeleteModal: false, deleteError: null });
    }

    deleteRecord = () => {
        const { itemData } = this.state;
        let templateId = itemData._id

        callApi(`/usermanagement/permission/permissionTemplate/${templateId}`, 'DELETE', null, null, null, true)
            .then(response => {
                const byjusGrid = this.refs.byjusGrid
                byjusGrid.refreshGrid();
                this.setState({ showDeleteModal: false, deleteError: null });
            })
            .catch(error => {
                error && error.message && this.setState({ deleteError: error.message })
            })
    }

    closeModal = () => {
        this.setState({
            showViewModal: false
        })
    }

    onClickView = (cell, row) => () => {
        this.setState({
            showViewModal: true,
            templateData: row
        })
    }

    componentDidMount = () => {
        /**To build the tooltips once all components are built */
        ReactTooltip.rebuild();
    }

    formatters = () => ({
        nameFormatter: (cell, row) => {
            let { user = {} } = this.props;
            const showUsersFlag = validatePermission(user, permissionTemplate.showUsersPermissionTemplate);

            if (showUsersFlag) {
                return <Link data-tip="Clone"
                    to={{
                        pathname: `permission-templates/${row._id}`,
                        state: {
                            templateData: row
                        }
                    }}
                > {cell}</Link >

            }
            else {
                return cell;
            }

        },
        actionFormatter: (cell, row) => {
            let { user = {} } = this.props;
            const editFlag = validatePermission(user, permissionTemplate.editPermissionTemplate);
            const deleteFlag = validatePermission(user, permissionTemplate.deletePermissionTemplate);
            const cloneFlag = validatePermission(user, permissionTemplate.clonePermissionTemplate);

            return (
                <div>
                    <Link data-tip="Clone"
                        to={`permission-templates/${row._id}/clone`}
                        hidden={!cloneFlag}
                        className="btn btn-success btn-sm"
                    ><i className="fa fa-clone" /></Link>
                    {' '}
                    <Button data-tip="View" color="info" size="sm" onClick={this.onClickView(cell, row)}>
                        <i className="fa fa-eye" />
                    </Button>
                    {' '}
                    <Link data-tip="Edit"
                        to={`permission-templates/${row._id}/edit`}
                        hidden={!editFlag}
                        className="btn btn-primary btn-sm"
                    ><i className="fa fa-pencil" /></Link>
                    {' '}
                    <Button data-tip="Delete" color="danger" size="sm" hidden={!deleteFlag} onClick={this.onClickDelete(cell, row)}>
                        <i className="fa fa-trash" />
                    </Button>
                </div>
            )
        }
    })

    render = () => {
        const { templateData, showViewModal, showDeleteModal, itemData, deleteError } = this.state;

        return (
            <Fragment>
                <Box>
                    <BoxHeader heading="Permission Template List" />
                    <BoxBody>
                        <ByjusGrid
                            isKey="_id"
                            ref="byjusGrid"
                            gridId="ums_permission_template_grid"
                            toolbarItems={this.buildToolbarItems()}
                            formatters={this.formatters()}
                            modelName="PermissionTemplate"
                            gridDataUrl={`/usermanagement/permission/permissionTemplate/list`}
                        />
                        <ModalWindow
                            showModal={showViewModal}
                            closeModal={this.closeModal}
                            closeButton={true}
                            heading="Template Details"
                        >
                            {templateData && <PermissionTemplateView templateData={templateData} />}
                        </ModalWindow>
                    </BoxBody>
                </Box>
                {showDeleteModal && <ConfirmationDialog
                    showModal={showDeleteModal}
                    closeModal={this.onCloseDeleteModal}
                    heading="Permission Template will be permanently deleted"
                    error={deleteError}
                    size="sm"
                    onClickConfirm={this.deleteRecord}
                />}
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionTemplateList)
