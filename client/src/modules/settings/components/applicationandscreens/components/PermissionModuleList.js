import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { get } from 'lodash';

import { showConfirmDialog, hideDialog } from 'modules/core/reducers/dialog'
import { callApi } from 'store/middleware/api'
import ConfirmationDialog from 'components/confirmationDialog'
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3'
import { permissionModule, validatePermission } from 'lib/permissionList';

class PermissionModule extends Component {
  constructor() {
    super()
    this.state = {
      showViewModal: false,
      templateData: null
    }
  }

  buildToolbarItems = () => {
    let { user = {} } = this.props;
    const createFlag = validatePermission(user, permissionModule.createPermissionModule);
    const { appName } = this.props

    return (
      <Fragment>
        <Link className="btn btn-secondary btn-sm" hidden={!createFlag} to={`applications-and-screens/create/${appName}`}>
          <i className="fa fa-plus"></i> {' '}Create
        </Link> {' '}
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

    callApi(`/usermanagement/permission/permissionModule/${templateId}`, 'DELETE', null, null, null, true)
      .then(response => {
        const byjusGrid = this.refs.byjusGrid
        byjusGrid && byjusGrid.refreshGrid();
        this.setState({ showDeleteModal: false, deleteError: null });
      })
      .catch(error => {
        error && error.message && this.setState({ deleteError: error.message })
      })
  }

  formatters = () => ({
    groupFormatter: (value) => {
      return value ? value.toUpperCase() : '';
    },
    entityFormatter: (cell, row) => {
      const entities = cell.map((record) => {
        return record && record.entity && record.entity.toUpperCase()
      })
      return entities && entities.join(', ')
    },
    actionFormatter: (cell, row) => {
      let { user = {}, appName } = this.props;
      const editFlag = validatePermission(user, permissionModule.editPermissionModule);
      const deleteFlag = validatePermission(user, permissionModule.deletePermissionModule);
      return (
        <div>
          <Link
            to={`applications-and-screens/${row._id}/edit/${appName}`}
            className="btn btn-primary btn-sm"
            hidden={!editFlag}
          ><i className="fa fa-pencil" /></Link>
          {' '}
          <Button color="danger" size="sm" hidden={!deleteFlag} onClick={this.onClickDelete(cell, row)}>
            <i className="fa fa-trash" />
          </Button>
        </div>
      )
    }
  })

  render() {
    const { appName } = this.props
    const { showDeleteModal, itemData, deleteError } = this.state

    return (
      <>
        <ByjusGrid
          isKey="_id"
          ref="byjusGrid"
          gridId="ums_permission_module_grid"
          formatters={this.formatters()}
          contextCriterias={[{
            selectedColumn: "app",
            selectedOperator: "equal",
            selectedValue: appName
          }]}
          toolbarItems={this.buildToolbarItems()}
          modelName="PermissionModule"
          gridDataUrl={`/usermanagement/permission/permissionModule/list`}
        />
        {showDeleteModal && <ConfirmationDialog
          showModal={showDeleteModal}
          closeModal={this.onCloseDeleteModal}
          heading="Permission Template will be permanently deleted"
          error={deleteError}
          size="sm"
          onClickConfirm={this.deleteRecord}
        />}
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  user: get(state, 'auth.user')
});

const mapDispatchToProps = dispatch => ({
  showDialog: (cancel, confirm, message) =>
    dispatch(showConfirmDialog(cancel, confirm, message, 'Delete')),
  hideDialog: () => dispatch(hideDialog())
})

export default connect(mapStateToProps, mapDispatchToProps)(PermissionModule)
