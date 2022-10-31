import React, { useRef, Fragment, useState } from 'react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { isEmpty, get, startCase } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import Confirm from 'components/confirm';
import { callApi } from 'store/middleware/api';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';

import SubDepartmentModal from './SubDepartmentModal';
import { element } from 'prop-types';

const SubDepartmentList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showSubDepartmentModal, setShowSubDepartmentModal] = useState(false);
  const user = useSelector(state => get(state, 'auth.user'));
  let byjusGridRef = useRef();

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, hierarchyPermissions.createSubDepartment);

    return (
      <Fragment>
        <Button color="secondary" size="sm" hidden={!createFlag} onClick={onClickCreate}>
          <i className="fa fa-plus"></i> Create
        </Button> {' '}
        {createFlag && !selectedRow ?
          <>
            <Button color="success" size="sm" disabled={!selectedRow}><i className="fa fa-users mr-2"></i> {' '}Roles</Button>{" "}
            <Button color="success" size="sm" disabled={!selectedRow}><i className="fa fa-sitemap mr-2"></i> {' '}Hierarchy</Button>
          </>
          :
          <>
            <Link className="btn btn-btn-sm" to={{ pathname: `/settings/setup-beta/subdepartments/${get(selectedRow, 'formattedName')}/role`, state: { subDepartmentData: selectedRow } }}>
              <i className="fa fa-users"></i> {' '}Roles
            </Link> {" "}
            <Link className="btn btn-success btn-sm" to={{ pathname: `/settings/setup-beta/subdepartments/${get(selectedRow, 'formattedName')}/team`, state: { subDepartmentData: selectedRow } }}>
              <i className="fa fa-sitemap"></i> {' '}Hierarchy
            </Link>
          </>
        }
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
    let departmentId = data.id;

    setLoading(true);
    callApi(`/usermanagement/setup-beta/subDepartment/${departmentId}`, 'DELETE', null, null, null, true)
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

  const closeSubDepartmentModal = () => {
    setShowSubDepartmentModal(false);
    setData(null);
  }

  const onClickCreate = () => {
    setShowSubDepartmentModal(true);
  }

  const onClickEdit = (data) => {
    setShowSubDepartmentModal(true);
    setData(data);
  }

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  }

  const onRowSelect = (row, isSelected, e) => {
    setSelectedRow(row);
  };

  const formatters = () => ({
    departmentFormatter: (departmentFormattedName) => {
      return startCase(departmentFormattedName);
    },
    actionFormatter: (cell, row) => {
      const editFlag = validatePermission(user, hierarchyPermissions.editSubDepartment);

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

  const selectRowProp = {
    mode: 'radio',
    bgColor: 'lightblue',
    clickToSelect: true,
    onSelect: onRowSelect
  };

  return (
    <Box>
      <BoxBody loading={loading} error={error}>
        <ByjusGrid
          isKey="_id"
          gridId="ums_subdepartment_beta_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          selectRow={selectRowProp}
          formatters={formatters()}
          modelName="SubDepartment"
          gridDataUrl="/usermanagement/hierarchy-beta/subDepartment/list"
        />
        {showSubDepartmentModal &&
          <SubDepartmentModal
            closeModal={closeSubDepartmentModal}
            refreshGrid={refreshGrid}
            data={data}
          />}
      </BoxBody>
    </Box>
  )
}

export default SubDepartmentList;
