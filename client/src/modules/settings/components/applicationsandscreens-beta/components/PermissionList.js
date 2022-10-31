import React, { Fragment, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { get } from 'lodash';

import { showConfirmDialog, hideDialog } from 'modules/core/reducers/dialog'
import { callApi } from 'store/middleware/api'
import ConfirmationDialog from 'components/confirmationDialog'
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3'
import { permissionModule, validatePermission } from 'lib/permissionList';

const PermissionList = (props) => {
  const [showViewModal, setShowViewModal] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [permissionData, setPermissionData] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  let byjusGridRef = useRef();

  const buildToolbarItems = () => {
    let { user = {}, appName } = props;
    const createFlag = validatePermission(user, permissionModule.createPermissionModule);

    return (
      <Fragment>
        <Link className="btn btn-secondary btn-sm" hidden={!createFlag} to={`applications-and-screens/create/${appName}`}>
          <i className="fa fa-plus"></i> {' '}Create
        </Link> {' '}
      </Fragment>
    )
  }

  const onClickDelete = (cell, row) => () => {
    setShowDeleteModal(true);
    setPermissionData(row);
  }

  const onCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteError(null);
  }

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  }

  const deleteRecord = () => {
    let permissionId = permissionData.id

    callApi(`/usermanagement/v1/permission/${permissionId}`, 'DELETE', null, null, null, true)
      .then(response => {
        byjusGridRef && refreshGrid();
        setShowDeleteModal(false);
        setDeleteError(null);
      })
      .catch(error => {
        error && error.message && setDeleteError(error.message);
      })
  }

  const formatters = () => ({
    groupFormatter: (value) => {
      return value ? value.toUpperCase() : '';
    },
    entityFormatter: (cell, row) => {
      return cell;
    },
    actionFormatter: (cell, row) => {
      let { user = {}, appName } = props;
      const editFlag = validatePermission(user, permissionModule.editPermissionModule);
      const deleteFlag = validatePermission(user, permissionModule.deletePermissionModule);
      return (
        <div>
          <Link
            to={`applications-and-screens/${row.id}/edit/${appName}`}
            className="btn btn-primary btn-sm"
            hidden={!editFlag}
          ><i className="fa fa-pencil" /></Link>
          {' '}
          <Button color="danger" size="sm" hidden={!deleteFlag} onClick={onClickDelete(cell, row)}>
            <i className="fa fa-trash" />
          </Button>
        </div>
      )
    }
  })

  const { appId } = props

  return (
    <>
      <ByjusGrid
        isKey="_id"
        ref={byjusGridRef}
        gridId="ums_permission_module_v2_grid"
        formatters={formatters()}
        contextCriterias={[{
          selectedColumn: "app_id",
          selectedOperator: "equal",
          selectedValue: appId
        }]}
        toolbarItems={buildToolbarItems()}
        modelName="Permission"
        gridDataUrl={`/usermanagement/v1/permission/list`}
        hideSearchModals={true}
      />
      {showDeleteModal && <ConfirmationDialog
        showModal={showDeleteModal}
        closeModal={onCloseDeleteModal}
        heading="Permission will be permanently deleted"
        error={deleteError}
        size="sm"
        onClickConfirm={deleteRecord}
      />}
    </>
  )
}

const mapStateToProps = (state) => ({
  user: get(state, 'auth.user')
});

const mapDispatchToProps = dispatch => ({
  showDialog: (cancel, confirm, message) =>
    dispatch(showConfirmDialog(cancel, confirm, message, 'Delete')),
  hideDialog: () => dispatch(hideDialog())
})

export default connect(mapStateToProps, mapDispatchToProps)(PermissionList)
