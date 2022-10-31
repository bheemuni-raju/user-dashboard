import React, { useRef, Fragment, useState } from 'react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { get, isEmpty } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import Confirm from 'components/confirm';
import { callApi } from 'store/middleware/api';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';

import DepartmentModal from './DepartmentModal';

const DepartmentList = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const user = useSelector(state => get(state, 'auth.user'));
  let byjusGridRef = useRef();

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, hierarchyPermissions.createDepartment);

    return (
      <Fragment>
        <Button color="secondary" size="sm" hidden={!createFlag} onClick={onClickCreate}>
          <i className="fa fa-plus"></i> {' '}Create
        </Button> {' '}
      </Fragment>
    )
  }

  const onClickDelete = async (data) => {
    let result = await Confirm();
    if (result) {
      deleteRecord(data);
    }
  }

  const deleteRecord = (data) => {
    let departmentId = data._id;

    setLoading(true);
    callApi(`/usermanagement/hierarchy/department/${departmentId}`, 'DELETE', null, null, null, true)
      .then(response => {
        setLoading(false);
        setError(null);
        byjusGridRef && refreshGrid();
      })
      .catch(error => {
        setLoading(false);
        setError(error);
      })
  }

  const closeDepartmentModal = () => {
    setShowDepartmentModal(false);
    setData(null);
  }

  const onClickCreate = () => {
    setShowDepartmentModal(true);
  }

  const onClickEdit = (data) => {
    setShowDepartmentModal(true);
    setData(data);
  }

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  }

  const formatters = () => ({
    actionFormatter: (cell, row) => {
      const editFlag = validatePermission(user, hierarchyPermissions.editDepartment);

      return (
        <div>
          <Button color="primary" size="sm" hidden={!editFlag} onClick={() => onClickEdit(row)}>
            <i className="fa fa-pencil" />
          </Button>
          {' '}
        </div>
      )
    }
  })

  return (
    <Box>
      <BoxBody loading={loading} error={error}>
        <ByjusGrid
          isKey="_id"
          gridId="ums_department_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          formatters={formatters()}
          modelName="Department"
          gridDataUrl="/usermanagement/hierarchy/department/list"
        />
        {showDepartmentModal &&
          <DepartmentModal
            closeModal={closeDepartmentModal}
            refreshGrid={refreshGrid}
            data={data}
          />}
      </BoxBody>
    </Box>
  )
}

export default DepartmentList;
