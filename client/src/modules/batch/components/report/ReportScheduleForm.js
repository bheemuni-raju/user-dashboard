import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import { chunk, isEmpty, concat } from 'lodash';

import { Page, PageBody, PageHeader } from 'components/page';
import { Box, BoxBody } from 'components/box';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

import ReportScheduleFilters from './filters/ReportScheduleFilters';
import { CREATED_DATE_COLUMNS } from '../../utils/batchUtils'

const ReportScheduleForm = (props) => {
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ reportTemplate, setReportTemplate ] = useState(null);
  const [ additionalFilters, setAdditionalFilters ] = useState([]);
  let reportTemplateFormRef = "", additionalFilterFormRef = "";

  useEffect(() => {
    const { reportId } = props.match.params;

    setLoading(true);
    callApi(`/batchmanagement/report/${reportId}`, "GET", null, null, null, true)
      .then(response => {
        const createdAtField = response.filters.find(({ field }) => CREATED_DATE_COLUMNS.includes(field))
        const additionalFilters = [];

        if ((createdAtField && !isEmpty(createdAtField)) || (isEmpty(response.filters))) {
          additionalFilters.push({
            key: 0,
            column: createdAtField ? createdAtField.field : "createdAt",
            operator: 'between',
            dataType: 'DATE',
            isMandatory: true
          })
        }
        setLoading(false);
        setAdditionalFilters(additionalFilters);
        setReportTemplate(response);
      })
      .catch(error => {
        setLoading(false);
        setError(error);
      });
  }, [])

  const buildFilter = (filterFormValues) => {
    return {
      conditionType: "and",
      conditions: filterFormValues
    };
  }

  const onClickSchedule = () => {
    const reportFormValues = reportTemplateFormRef.validateFormAndGetValues();
    const filterFormValues = additionalFilterFormRef.validateFormAndGetValues();

    if (reportFormValues && filterFormValues) {
      const payload = {
        jobName: reportFormValues.jobName,
        reportFormattedName: reportFormValues.formattedName,
        email: props.user.email,
        filters: buildFilter(filterFormValues)
      };

      setLoading(true);
      return callApi(`/batchmanagement/report/schedule`, "POST", payload, null, null, true)
        .then(response => {
          setLoading(false);
          props.history.goBack();
        })
        .catch(error => {
          setLoading(false);
        })
    }
  }

  const renderTemplate = (reportTemplate) => {
    const sets = chunk(reportTemplate.collectionHeaders, 4);
    const headerFields = [{
      type: "text",
      name: "name",
      disabled: true,
      required: true,
      label: "Report Template Name"
    }, {
      type: "readonly",
      name: "formattedName",
      label: "Report Formatted Name"
    }, {
      type: "text",
      name: "jobName",
      required: true,
      label: "Job Name"
    }]

    return (
      <div>
        <FormBuilder
          ref={(element) => reportTemplateFormRef = element}
          initialValues={reportTemplate}
          fields={headerFields}
          cols={3}
        />
        <div className="field-group">
          <b>Filters : </b>
          {renderFilterTemplate()}
        </div>
        <div className="field-group">
          <b>Exportable Columns : </b>
          <div>
            {sets.map((cols, idx) => (
              <Col key={idx}>
                {cols.map((field, idx) => (
                  <li key={idx}>{field}</li>
                ))}
              </Col>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderFilterTemplate = () => {
    let filterColumns = reportTemplate ? reportTemplate.filters : [];
    filterColumns = concat(filterColumns, additionalFilters);
    for (let index = 0; index < filterColumns.length; index++) {
      const { column } = filterColumns[index];
      if (CREATED_DATE_COLUMNS.includes(column)) {
        filterColumns[index].default = true;
        filterColumns[index].operator = 'between';
      }
    }

    return (
      <div className="field-group my-1">
        <ReportScheduleFilters
          columns={filterColumns}
          ref={ (element) => additionalFilterFormRef = element}
        />
      </div>
    )
  }

  return (
    <Page loading={loading}>
      <PageHeader heading={`Schedule Report Job - ${reportTemplate && reportTemplate.name}`} />
      <PageBody error={error}>
          {reportTemplate && renderTemplate(reportTemplate)}
          <br />
          <div className="text-right">
            <Button type="button" color="success" onClick={onClickSchedule}>Schedule</Button>
            {'  '}
            <Button type="button" color="danger" onClick={() => props.history.goBack()}>Cancel</Button>
          </div>
      </PageBody>
    </Page>
  )
}

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(ReportScheduleForm);