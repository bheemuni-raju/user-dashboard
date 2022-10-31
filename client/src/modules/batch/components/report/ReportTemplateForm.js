import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';
import { Transfer } from 'antd';
import Notify from 'react-s-alert';
import _ from 'lodash';

import { Page, PageBody, PageHeader } from 'components/page';
import { Box, BoxBody } from 'components/box';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';
import ReportTemplateFilters from './filters/ReportTemplateFilters';

import { CREATED_DATE_COLUMNS } from '../../utils/batchUtils'


const mapStateToProps = (state) => ({
  user: get(state, 'auth.user')
})

class ReportTemplateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      reportTemplate: null,
      dbList: [
        { label: "byjus-nucleus", value: "byjus-nucleus" },
        { label: "byjus-leado", value: 'byjusleado' },
        { label: "friendly-potato", value: 'friendly-potato' }
      ],
      comboLoading: false,
      db: null,
      collection: null,
      collectionList: [],
      modelName: null,
      modelList: [],
      associateModels: [],
      associateModelList: [],
      columnList: [],
      allColumnKeys: [],
      targetColumnKeys: [],
      selectedColumnKeys: [],
      selectedFilterIndex: 0,
      filtersErrors: {},
      dbType: "mongodb",
      isTemplateDirty: false
    }
  }

  onClickSave = () => {
    const { targetColumnKeys, allColumnKeys, associateModels } = this.state;
    const { reportId } = this.props.match.params;
    const reportTemplateForm = this.refs.reportTemplateForm;
    const searchFilterForm = this.refs.searchFilterForm;
    const formValues = reportTemplateForm.validateFormAndGetValues();
    const filterValues = searchFilterForm.validateFormAndGetValues();

    if (formValues && targetColumnKeys.length && filterValues) {

      //`createAt`(`created_At` for certain collections) column should be added by default
      const filtersForPayload = [];
      let createdAtColumn = allColumnKeys.find(({ key }) => CREATED_DATE_COLUMNS.includes(key));
      if (createdAtColumn && !isEmpty(createdAtColumn)) {
        filtersForPayload.push({ column: createdAtColumn.key, dataType: 'DATE' });
      }
      filtersForPayload.push(...(filterValues || []))

      const payload = {
        ...formValues,
        collectionHeaders: targetColumnKeys,
        filters: filtersForPayload,
        associateModels
      };

      if (reportId) {
        this.updateReportTemplate(payload, reportId);
      }
      else {
        this.createReportTemplate(payload);
      }
    }
    else {
      !targetColumnKeys.length && Notify.error(`Atleast one column is required to create a template.`);
    }
  }

  createReportTemplate = (payload) => {
    const { user } = this.props;

    payload["createdBy"] = get(user, 'email');
    this.setState({ loading: true })
    return callApi(`/batchmanagement/report`, "POST", payload, null, null, true)
      .then(res => {
        this.setState({ loading: false, reportTemplate: res });
        this.props.history.goBack();
      })
      .catch(error => {
        this.setState({ loading: false });
        this.setState({error:error.message})
      });
  }

  updateReportTemplate = (payload, reportId) => {
    const { user } = this.props;

    payload["updatedBy"] = get(user, 'email');

    this.setState({ loading: true })
    return callApi(`/batchmanagement/report/${reportId}`, "PUT", payload, null, null, true)
      .then(res => {
        this.setState({ loading: false, reportTemplate: res });
        this.props.history.goBack();
      })
      .catch(error => {
        this.setState({ loading: false });
      });
  }

  buildTemplateDetailsForm = () => {
    const { reportTemplate, dbList, collectionList, comboLoading, db, dbType, collection,
      allColumnKeys, targetColumnKeys, selectedColumnKeys } = this.state;

    let fields = [{
      type: "text",
      name: "name",
      required: true,
      label: "Report Template Name"
    },
    {
      type: "select",
      name: "appCategory",
      required: true,
      label: "App Category",
      options: [
        { label: "LMS", value: "lms" },
        { label: "OMS", value: "oms" },
        { label: "POMS", value: "poms" },
        { label: "PMS", value: "pms" },
        { label: "SOS", value: "sos" },
        { label: "STMS", value: "stms" },
        { label: "UMS", value: "ums" },
        { label: "FMS", value: "fms" },
      ]
    }, {
      type: "select",
      name: "moduleCategory",
      required: true,
      label: "Module Category",
      options: [
        { label: "FMS Reconcilation", value: "fms_reconcilation" },
        { label: "FMS Invoice", value: "fms_invoice" },
        { label: "FMS Credit Notes", value: "fms_credit_notes" },
        { label: "LMS Loan Creation", value: "lms_loan_creation" },
        { label: "LMS Nach", value: 'lms_nach' },
        { label: "LMS Collection", value: 'lms_collection' },
        { label: "LMS Foreclosure", value: 'lms_foreclosure' },
        { label: "LMS Manual Payment", value: 'lms_manual_payment' },
        { label: "OMS Order Creation", value: 'oms_order_creation' },
        { label: "OMS Inventory Creation", value: 'oms_inventory_creation' },
        { label: "OMS Sku", value: 'oms_sku' },
        { label: "OMS Cashback", value: 'oms_cashback' },
        { label: "PMS Finance Reconciliation", value: 'pms_finance_reconciliation' },
        { label: "SOS Attendance", value: 'sos_attendance' },
        { label: "UMS Employee Creation", value: 'ums_employee_creation' },
        { label: "UMS Employee Validation", value: 'ums_employee_validation' },
        { label: "UMS Attendance", value: 'ums_attendance' }
      ]
    },
    {
      type: "select",
      name: "databaseType",
      required: true,
      label: "Database Type",
      options: [
        { label: "MongoDB", value: "mongodb" },
        { label: "Postgres", value: "postgres" }
      ],
      onChange: this.onChangeDbType
    }
    ];

    if (dbType === "mongodb") {
      fields.push(
        {
          type: "select",
          name: "databaseName",
          required: true,
          label: "Database Name",
          options: dbList,
          value: db,
          onChange: this.onChangeDB
        },
        {
          type: "select",
          name: "collectionName",
          required: true,
          label: "Db Collection Name",
          options: collectionList,
          loading: comboLoading,
          collection: collection,
          onChange: this.onChangeCollection
        }
      )
    }

    if (this.state.dbType === "postgres") {
      fields.push(
        {
          type: "select",
          name: "modelName",
          required: true,
          label: "Db Model Name",
          options: this.state.modelList,
          onChange: this.onChangeModelName
        }
      )
      fields.push(
        {
          type: "select",
          isMulti: true,
          name: "associateModels",
          required: false,
          label: "Associate Model Name",
          options: this.state.associateModelList,
          onChange: this.onChangeAssociateModel
        }
      )
    }

    fields.push({
      type: "select",
      name: "outputFormat",
      required: false,
      label: "Output Format",
      options: [
        { label: "XLS", value: "xls" },
        { label: "CSV", value: "csv" }
      ]
    })

    return (<>
      <FormBuilder
        ref="reportTemplateForm"
        initialValues={reportTemplate}
        fields={fields}
        cols={3}
      />
      <div>
        <h6>Export Columns : </h6>
        <Transfer
          dataSource={allColumnKeys}
          showSearch
          titles={['Available Columns', 'Selected Columns']}
          listStyle={{
            width: '40%',
            height: 500,
          }}
          targetKeys={targetColumnKeys}
          selectedKeys={selectedColumnKeys}
          onChange={this.handleColumnSelectionChange}
          onSelectChange={this.handleSelectChange}
          render={item => item.title}
        />
      </div>

      <div className="mt-3">
        <h6>Select Required Filters : </h6>
        <ReportTemplateFilters
          columns={allColumnKeys.filter(col => !CREATED_DATE_COLUMNS.includes(col.key))}
          ref="searchFilterForm"
          initialValues={reportTemplate && reportTemplate.filters.filter(({ column }) => !CREATED_DATE_COLUMNS.includes(column))}
        />
      </div>

    </>)
  }

  handleColumnSelectionChange = (nextTargetKeys, direction, moveKeys) => {
    this.setState({ targetColumnKeys: nextTargetKeys });
  };

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedColumnKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  };

  getDataColumns = () => {
    const { reportTemplate, columnList, collectionHeaders = [] } = this.state || {};

    const selectedColumnKeys = [];
    const targetColumnKeys = [];

    const allColumnKeys = columnList.map((col, index) => {
      const { dataField } = col || {};
      if (collectionHeaders.indexOf(dataField) >= 0) {
        targetColumnKeys.push(dataField);
      }
      return {
        key: dataField,
        title: dataField
      }
    });

    this.setState({ allColumnKeys, targetColumnKeys, selectedColumnKeys });
  };

  onChangeDB = (value, collectionHeaders, collection) => {
    this.setState({ collectionList: [], columnList: [], allColumnKeys: [], targetColumnKeys: [], selectedColumnKeys: [], associateModelList: [], associateModels: [], collectionHeaders: [], collection: '' });
    collectionHeaders && Array.isArray(collectionHeaders) && this.setState({ collectionHeaders });
    if (value) {
      this.setState({ loading: true, comboLoading: true, collectionList: [], columnList: [] });
      return callApi(`/model/list`, "POST", { database: value }, null, null, true)
        .then(res => {
          this.setState({ loading: false, collectionList: res, db: value, comboLoading: false, error: null });
          collection && this.onChangeCollection(collection);
        })
        .catch(error => {
          this.setState({ loading: false, comboLoading: false, error });
        });
    }
  }


  onChangeCollection = (value, args) => {
    const { db } = this.state;
    this.setState({ columnList: [], allColumnKeys: [], targetColumnKeys: [], selectedColumnKeys: [] });

    if (value) {
      this.setState({ loading: true, comboLoading: true, columnList: [] });
      return callApi(`/model/column/list`, "POST", { model: value, database: db }, null, null, true)
        .then(res => {
          this.setState({ columnList: res, collection: value, comboLoading: false, loading: false, error: null });
          this.getDataColumns(res);
        })
        .catch(error => {
          this.setState({ comboLoading: false, loading: false, error });
        });
    }
  }

  onChangeDbType = (value, args) => {
    if (value === "postgres") {
      this.setState({ collectionList: [], columnList: [], allColumnKeys: [], targetColumnKeys: [], selectedColumnKeys: [], associateModelList: [], associateModels: [], collectionHeaders: [], modelList: [], collection: '', modelName: '' });
      this.getPgDatabaseModels(value);
    }
    else if (value === "mongodb") {
      value && this.setState({ dbType: value, modelList: [], modelName: '' });
      const { collectionHeaders, db, collection } = this.state;
      this.onChangeDB(db, collectionHeaders, collection);
    }
  }

  onChangeModelName = (value) => {
    this.setState({ loading: true, comboLoading: true, columnList: [], allColumnKeys: [], targetColumnKeys: [], selectedColumnKeys: [], associateModels: [], collectionHeaders: [], modelName: '' }, () => {
      this.getModelColumns(value);
      this.getAssociateModels(value);
    });
  }


  onChangeAssociateModel = (values) => {
    if (Array.isArray(values) && values.length > 0) {
      this.getAssociatedModelColumns(values);
    }
    else {
      this.setState({ associateModels: [], associateModelList: [] }, () => {
        this.getModelColumns(this.state.modelName);
      });
    }
  }

  
  getPgDatabaseModels = (value) => {
    this.setState({ loading: false, comboLoading: false, modelList: [], dbType: '' });
    return callApi(`/usermanagement/common/model/pgList`, "POST", { dbType: value }, null, null, true)
      .then(res => {
        this.setState({ loading: false, comboLoading: false, modelList: res, dbType: value });
      })
      .catch(error => {
        this.setState({ loading: false, comboLoading: false, error });
      })
  };

  getModelColumns = (value) => {
    if (value) {
      this.setState({ loading: true, comboLoading: true, columnList: [] });
      return callApi(`/usermanagement/common/model/column/pgList`, "POST", { modelName: value }, null, null, true)
        .then(res => {
          this.setState({ columnList: (Array.isArray(res) && res.length > 0 ? res : []), modelName: value, comboLoading: false, loading: false, error: null });
          this.getDataColumns();
        })
        .catch(error => {
          this.setState({ comboLoading: false, loading: false, error });
        });
    }
  }

  getAssociateModels = (value) => {
    this.setState({ loading: true, comboLoading: true, associateModelList: [''],associateModels:[] });
    // check for the associates table/model for the respective selected model.
    return callApi(`/usermanagement/common/model/associations/pgList/${value}`, "GET", null, null, null, true)
      .then(res => {
        this.setState({ associateModelList: (Array.isArray(res) && res.length > 0 ? res : ['']), comboLoading: false, loading: false, error: null });
      })
      .catch(error => {
        this.setState({ comboLoading: false, loading: false, error });
      });
  }

  getAssociatedModelColumns = (values) => {
    this.setState({ comboLoading: true, loading: true, associateModels: [], columnList: [] })
    if (Array.isArray(values) && values.length > 0) {
      this.getModelColumns(this.state.modelName).then(() => {
        callApi(`/usermanagement/common/model/associations/column/pgList`, "POST", { modelNames: values }, null, null, true)
          .then(res => {
            if (Array.isArray(res) && res.length > 0) {
              this.setState({ columnList: [...this.state.columnList, ...res], associateModels: values, comboLoading: false, loading: false, error: null }, () => {
                this.getDataColumns();
              });
            }
          })
          .catch(error => {
            this.setState({ comboLoading: false, loading: false, error });
          });
      });
    };
  }

  componentDidMount = () => {
    const { reportId } = this.props.match.params;

    if (reportId) {
      this.setState({ loading: true })
      return callApi(`/batchmanagement/report/${reportId}`, "GET", null, null, null, true)
        .then(res => {
          const db = get(res, 'databaseName');
          const collection = get(res, 'collectionName');
          const databaseType = get(res, 'databaseType');
          const collectionHeaders = get(res, 'collectionHeaders');
          const modelName = get(res, 'modelName');
          const associateModels = get(res, 'associateModels');
          const reportTemplate = { ...res, databaseType: databaseType ? databaseType : this.state.dbType };

          this.setState({
            loading: false, reportTemplate: reportTemplate, db, collection,
            modelName,
            associateModels,
            collectionHeaders
          }, () => {
            if (reportTemplate.databaseType === 'postgres') {
              this.getPgDatabaseModels(reportTemplate.databaseType);
              this.getModelColumns(modelName);
              this.getAssociateModels(modelName);
              this.getAssociatedModelColumns(associateModels);
            }
            else if (reportTemplate.databaseType === 'mongodb') {
              const { collectionHeaders, db, collection } = this.state;
              this.onChangeDB(db, collectionHeaders, collection);
            }
          });
        })
        .catch(error => {
          this.setState({ loading: false });
        })
    }
  }

  render() {
    const { reportTemplate, loading, error } = this.state;
    const type = reportTemplate ? "Edit" : "New";
    return (
      <Page>
        <PageHeader heading={`${type} Report Template`} />
        <PageBody >
          <Box>
            <BoxBody loading={loading} error={error}>
              {this.buildTemplateDetailsForm()}
              <div className="text-right">
                <Button type="button" color="success" onClick={() => this.onClickSave()}>Save</Button>
                {'   '}
                <Button type="button" color="danger" onClick={() => this.props.history.goBack()}>Cancel</Button>
              </div>
            </BoxBody>
          </Box>
        </PageBody>
      </Page>
    )
  }
}


export default connect(mapStateToProps)(ReportTemplateForm);