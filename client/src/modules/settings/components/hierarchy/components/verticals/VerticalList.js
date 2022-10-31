import React, { useRef, useState } from 'react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { isEmpty, get, startCase } from 'lodash';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import Confirm from 'components/confirm';
import { callApi } from 'store/middleware/api';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';
import VerticalModal from './VerticalModal';

const VerticalList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showVerticalModal, setShowVerticalModal] = useState(false);
  const user = useSelector(state => get(state, 'auth.user'));
  let byjusGridRef = useRef();

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, hierarchyPermissions.createVertical);

    return (
      <Button color="secondary" size="sm" hidden={!createFlag} onClick={onClickCreate}>
        <i className="fa fa-plus"></i> {' '}Create
      </Button>
    )
  }

  const onClickDelete = async (data) => {
    let result = await Confirm();
    if (result) {
      deleteRecord(data);
    }
  }

  const deleteRecord = (data) => {
    let verticalId = data._id;

    setLoading(true);
    callApi(`/usermanagement/hierarchy/vertical/${verticalId}`, 'DELETE', null, null, null, true)
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

  const closeVerticalModal = () => {
    setShowVerticalModal(false);
    setData(null);
  }

  const onClickCreate = () => {
    setShowVerticalModal(true);
  }

  const onClickEdit = (data) => {
    setShowVerticalModal(true);
    setData(data);
  }

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  }

  const formatters = () => ({
    departmentFormatter: (departmentFormattedName) => {
      return startCase(departmentFormattedName);
    },
    subdepartmentFormatter: (subDepartmentFormattedName) => {
      return startCase(subDepartmentFormattedName);
    },
    actionFormatter: (cell, row) => {
      const editFlag = validatePermission(user, hierarchyPermissions.editVertical);
      const deleteFlag = validatePermission(user, hierarchyPermissions.deleteVertical);

      return (
        <div>
          <Button color="primary" size="sm" hidden={!editFlag} onClick={() => onClickEdit(row)}>
            <i className="fa fa-pencil" />
          </Button>
          {' '}
          <Button color="danger" size="sm" hidden={!deleteFlag} onClick={() => onClickDelete(row)}>
            <i className="fa fa-trash" />
          </Button>
        </div>
      )
    }
  })

  return (
    <Box>
      <BoxBody loading={loading} error={error}>
        <ByjusGrid
          isKey="_id"
          gridId="ums_vertical_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          formatters={formatters()}
          modelName="Vertical"
          gridDataUrl="/usermanagement/hierarchy/vertical/list"
        />
        {showVerticalModal &&
          <VerticalModal
            closeModal={closeVerticalModal}
            refreshGrid={refreshGrid}
            data={data}
          />
        }
      </BoxBody>
    </Box>
  )
}

export default VerticalList;