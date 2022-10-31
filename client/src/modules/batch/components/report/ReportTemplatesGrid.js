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

const ReportGrid = (props) => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [error, setError] = useState(null);
  const { user } = props;
  const gridRef = useRef();

  const buildToolbarItems = () => {
    const canCreateReportTemplate = validatePermission(user, batch.createReport);

    return (
      <>
        {canCreateReportTemplate && <Button size="sm" onClick={onClickCreate}>
          <i className="fa fa-plus"></i> {' '}Create
        </Button>
        }
      </>
    )
  };

  const onClickCreate = () => {
    history.push(`report/create`);
  }

  const onClickEdit = (row) => {
    history.push(`report/edit/${row._id}`);
  }

  const onClickSchedule = (row) => {
    history.push(`report/schedule/${row._id}`);
  }

  const generateReport = (row) => {
    const email = Array.isArray(user.email) ? user.email[0] : user.email
    const bodyPayload = {
      formattedName: row.formattedName,
      email
    };

    setLoading(true);
    return callApi("/batchmanagement/report/export", "POST", bodyPayload, null, null, true)
      .then(res => {
        setLoading(false);
        Notify.success("Report successfully scheduled. You will receive an email shortly.");
      })
      .catch(error => {
        setLoading(false);
        Notify.success("Error occured while scheduling report.");
      })
  }

  const onClickDelete = async (data) => {
    let result = await Confirm();
    if (result) {
      deleteReportTemplate(data);
    }
  }

  const deleteReportTemplate = (row) => {
    setLoading(true);
    setError(null);
    return callApi(`/batchmanagement/report/${get(row, "_id")}`, "DELETE", null, null, null, true)
      .then(res => {
        setLoading(false);
        gridRef.current && gridRef.current.refreshGrid();
      })
      .catch(error => {
        setLoading(false);
        setError(error)
        Notify.success("Error occured while deleting report template.");
      })
  }

  const canEditReportTemplate = validatePermission(user, batch.editReport);
  const canDeleteReportTemplate = validatePermission(user, batch.deleteReport);
  const canScheduleReportTemplate = validatePermission(user, batch.scheduleReport);

  const columns = [{
    dataField: "_id",
    text: "Id",
    filterType: "TEXT",
    hidden: true,
  }, {
    dataField: "name",
    text: "Template Name",
    filterType: "TEXT",
    quickFilter: true
  }, {
    dataField: "actions",
    sort: false,
    text: "Actions",
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
            isAllowed: canEditReportTemplate
          }, {
            title: 'Schedule',
            icon: 'fa fa-clock-o',
            onClick: () => onClickSchedule(row),
            isAllowed: canScheduleReportTemplate
          }, {
            title: 'Delete',
            icon: 'fa fa-trash',
            onClick: () => onClickDelete(row),
            isAllowed: canDeleteReportTemplate
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
      <BoxHeader heading="Report Templates" />
      <BoxBody loading={loading} error={error}>
        <ByjusGrid
          ref={gridRef}
          columns={columns}
          gridDataUrl="/batchmanagement/report/list"
          modelName="ReportTemplate"
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

export default connect(mapStateToProps)(ReportGrid)
