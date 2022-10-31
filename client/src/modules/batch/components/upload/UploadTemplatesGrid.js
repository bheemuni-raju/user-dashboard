import React, { useState, useRef } from 'react';

import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { Button } from "reactstrap";
import Notify from 'react-s-alert';
import { get } from 'lodash';

import { Box, BoxBody, BoxHeader } from 'components/box';
import { callApi } from 'store/middleware/api';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';
import Confirm from 'components/confirm';
import ByjusDropdown from 'components/ByjusDropdown';

import { batch, validatePermission } from 'lib/permissionList';

const UploadTemplatesGrid = (props) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = props;
  const gridRef = useRef();

  const buildToolbarItems = () => {
    const canCreateUploadTemplate = validatePermission(user, batch.createUpload);

    return (
      <>
        {canCreateUploadTemplate && <Button size="sm" onClick={onClickCreate}>
          <i className="fa fa-plus"></i> {' '}Create
        </Button>
        }
      </>
    )
  }

  const onClickCreate = () => {
    history.push(`upload/create`);
  }

  const onClickEdit = (row) => {
    history.push(`upload/edit/${row._id}`);
  }

  const onClickUpload = (row) => {
    history.push(`upload/schedule/${row._id}`);
  }

  const onClickDelete = async (data) => {
    let result = await Confirm();
    if (result) {
      deleteUploadTemplate(data);
    }
  }

  const deleteUploadTemplate = (row) => {
    setLoading(true);
    setError(null);
    return callApi(`/batchmanagement/upload/${get(row, "_id")}`, "DELETE", null, null, null, true)
      .then(res => {
        setLoading(false);
        gridRef.current && gridRef.current.refreshGrid();
      })
      .catch(error => {
        setLoading(false);
        setError(error);
        Notify.success("Error occured while deleting report template.");
      })
  }

  const canEditUploadTemplate = validatePermission(user, batch.editUpload);
  const canDeleteUploadTemplate = validatePermission(user, batch.deleteUpload);
  const canScheduleUploadTemplate = validatePermission(user, batch.scheduleUpload);

  const columns = [{
    dataField: "_id",
    text: "Id",
    filterType: "TEXT",
    hidden: true
  }, {
    dataField: "name",
    text: "Template Name",
    filterType: "TEXT",
    quickFilter: true
  }, {
    dataField: "actions",
    sort: false,
    text: "Actions",
    width: "350px",
    formatter: (cell, row) => {
      return (
        <ByjusDropdown
          type="simple"
          defaultTitle="Actions"
          titleIcon="fa fa-gear"
          items={[{
            title: 'Edit',
            icon: 'fa fa-pencil',
            onClick: () => onClickEdit(row),
            isAllowed: canEditUploadTemplate
          }, {
            title: 'Upload',
            icon: 'fa fa-clock-o',
            onClick: () => onClickUpload(row),
            isAllowed: canScheduleUploadTemplate
          }, {
            title: 'Delete',
            icon: 'fa fa-trash',
            onClick: () => onClickDelete(row),
            isAllowed: canDeleteUploadTemplate
          }]} />
      );
    }
  }, {
    dataField: "formattedName",
    text: "Template Formatted Name",
    filterType: "TEXT"
  }, {
    dataField: "createdBy",
    text: "Template Created By",
    filterType: "TEXT"
  }, {
    dataField: "updatedBy",
    text: "Template Updated By",
    filterType: "TEXT"
  }, {
    dataField: "moduleCategory",
    text: 'Module',
    filterType: "TEXT"
  }, {
    dataField: "appCategory",
    text: "Application",
    filterType: "TEXT"
  }];

  return (
    <Box>
      <BoxHeader heading="Upload Templates" />
      <BoxBody loading={loading} error={error}>
        <ByjusGrid
          ref={gridRef}
          columns={columns}
          gridDataUrl="/batchmanagement/upload/list"
          modelName="UploadTemplate"
          sort={{ name: 'ASC' }}
          contextCriterias={[{
            selectedColumn: "appCategory",
            selectedOperator: "in",
            selectedValue: ["ums"]
          }]}
          toolbarItems={buildToolbarItems()} />
      </BoxBody>
    </Box>
  )
}

const mapStateToProps = state => ({
  user: state.auth.user
})

export default connect(mapStateToProps)(UploadTemplatesGrid)
