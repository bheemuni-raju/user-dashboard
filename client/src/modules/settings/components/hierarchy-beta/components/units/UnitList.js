import React, { useRef, useState } from 'react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { isEmpty, get, startCase } from 'lodash';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import Confirm from 'components/confirm';
import { callApi } from 'store/middleware/api';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';

import UnitModal from './UnitModal';

const UnitList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const user = useSelector(state => get(state, 'auth.user'));
  let byjusGridRef = useRef();

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, hierarchyPermissions.createUnit);

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
    let unitId = data.id;

    setLoading(true);
    callApi(`/usermanagement/hierarchy-beta/unit/${unitId}`, 'DELETE', null, null, null, true)
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

  const closeUnitModal = () => {
    setShowUnitModal(false);
    setData(null);
  }

  const onClickCreate = () => {
    setShowUnitModal(true);
  }

  const onClickEdit = (data) => {
    setShowUnitModal(true);
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
      const editFlag = validatePermission(user, hierarchyPermissions.editUnit);
      const deleteFlag = validatePermission(user, hierarchyPermissions.deleteUnit);

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
          gridId="ums_unit_beta_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          formatters={formatters()}
          modelName="Unit"
          gridDataUrl="/usermanagement/hierarchy-beta/unit/list"
        />
        {showUnitModal &&
          <UnitModal
            closeModal={closeUnitModal}
            refreshGrid={refreshGrid}
            data={data}
          />}
      </BoxBody>
    </Box>
  )
}

export default UnitList;