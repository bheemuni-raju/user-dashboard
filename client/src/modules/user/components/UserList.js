import React, { Component, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import { startCase, isEmpty, get } from 'lodash';
import { user as userPermissions, validatePermission } from 'lib/permissionList';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';

const UserList = (props) => {
  const user = useSelector(state => get(state, 'auth.user'));

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, userPermissions.createUserProfile);

    return (
      <Fragment>
        <Link className="btn btn-secondary btn-sm" hidden={!createFlag} to="/settings/master-employees/create">
          <i className="fa fa-plus"></i> {' '}Create
        </Link>{' '}
      </Fragment>
    )
  }

  const formatters = () => ({
    nameFormatter: (cell, row) => {
      const editFlag = validatePermission(user, userPermissions.editUserProfile);
      let { email, department = {} } = row;
      department = isEmpty(department) ? [] : department.filter((dept) => {
        return !isEmpty(dept);
      });

      if (editFlag) {
        return <Link to={{ pathname: `/settings/master-employees/${row.email}/${department ? department[0] : "-"}/edit` }}>{startCase(cell)}</Link>
      }
      else {
        return startCase(cell);
      }
    },
    actionFormatter: (cell, row) => {
      const editFlag = validatePermission(user, userPermissions.editUserProfile);
      let { department = {}, subDepartment = {} } = row;
      department = isEmpty(department) ? [] : department.filter((dept) => {
        return !isEmpty(dept);
      });

      if (subDepartment != "sales") {
        return (
          <>
            <Link to={{
              pathname: `/settings/master-employees/${row.email}/${department ? department[0] : ""}/edit`
            }}
              hidden={!editFlag}
              className="btn btn-primary btn-sm">
              <i className="fa fa-pencil" />
            </Link>
          </>
        )
      }
      else {
        return <div>N/A</div>
      }
    }
  })

  return (
    <>
      <Alert color="info">
        Employee List is shown from Master Employee collection, on edit it will get Employee details from respective department collection.
        Don't edit any employee data from different department.
        This should be used to update permission templates
        </Alert>
      <ByjusGrid
        isKey="_id"
        gridId="ums_master_grid"
        toolbarItems={buildToolbarItems()}
        formatters={formatters()}
        modelName="MasterEmployee"
        gridDataUrl={`/usermanagement/employee/listMasterData`}
      />
    </>
  )
}

export default UserList;
