import React, { Component, Fragment } from 'react'
import { Button, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap'
import Select from 'react-select'
import { remove, isEmpty } from 'lodash'
import { connect } from 'react-redux'
import moment from 'moment';
import classNames from 'classnames';

import { callApi } from "store/middleware/api";
import TabBuilder from "modules/core/components/TabBuilder";
import { Box, BoxBody } from 'components/box'
import { FormBuilder } from "components/form";
import { addOperators } from './AdvanceSearchUtil'
import FavouriteSearchModal from '../favouriteSearch/FavouriteSearchModal';

import { getFavouriteFilter, removeFavouriteFilter } from "../favouriteSearch/FavouriteSearch";

import './AdvanceSearch.css'

const mapStateToProps = state => ({
  user: state.auth.user
})

class AdvanceSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      columnOptions: [],
      selectedTab: 1,
      operatorOptions: [],
      selectedColumn: {},
      selectedOperator: {},
      selectedValue: {},
      searchCriterias: [],
      viewAdvanceSearchModal: true,
      anyCriteria: true,
      allCriteria: false,
      columnList: [],
      selectedValueType: '',
      isSelectOption: false,
      initialValue: {},
      validationErrors: {},
      disableValueField: false,
      filter: [],
      searchCriteriasOptions: []
    }

  }

  /** Get Advance search column options Dynamically */
  getFormFields = async () => {
    const { gridId } = this.props;
    if (gridId && gridId != undefined) {
      await callApi(`/getFields/${gridId}`, 'GET', null, null, null, true)
        .then(response => {
          this.setState({ columnList: response.resp })
        })
        .catch(error => {
          this.setState({ columnList: [] })
        })
    } else {
      this.setState({ columnList: [] })
    }
  }

  /** Get Favourite Search Filter Options  if GridId exists*/
  getFavouriteFilter = async () => {
    const { gridId, user } = this.props;
    const emailId = user.email
    if (gridId && gridId != undefined) {
      const favouriteFilterResponse = await getFavouriteFilter(gridId, emailId)
      this.setState({ filter: favouriteFilterResponse.favouriteFilter, searchCriteriasOptions: favouriteFilterResponse.searchCriteriasOptions })
    }
  }

  componentDidMount = async () => {
    await this.getFormFields()
    await this.getFavouriteFilter()
    const { columns, searchCriterias = [] } = this.props
    const { columnList } = this.state
    let optionList = []
    if (columnList.length > 0) {
      optionList = columnList
    } else {
      optionList = columns
    }
    const columnsWithOperators = addOperators(optionList)
    this.setState({
      columnOptions: columnsWithOperators,
      searchCriterias
    })
    if (searchCriterias.length > 0) {
      this.setState({
        selectedColumn: searchCriterias[0].selectedColumn,
        operatorOptions: searchCriterias[0].selectedColumn.operators,
        selectedOperator: searchCriterias[0].selectedOperator,
        selectedValue: searchCriterias[0].selectedValue
      })
    }
  }

  onChangeColumn = (selectedOption) => {
    this.setState({
      selectedColumn: selectedOption || '',
      operatorOptions: selectedOption ? selectedOption.operators : [],
      selectedValueType: selectedOption ? selectedOption.type : 'text',
      isSelectOption: (selectedOption && selectedOption.type === 'select') ? true : false,
    })
  }

  onChangeOperator = (selectedOperator) => {
    let valueType = 'text';
    let valueFieldDisable = false
    if (selectedOperator && selectedOperator.value === 'in') {
      valueType = 'textarea'
    } else if (selectedOperator && selectedOperator.value === 'between') {
      valueType = 'between'
    } else if (selectedOperator && (selectedOperator.value === 'exists' || selectedOperator.value === 'not_exists')) {
      valueFieldDisable = true
    }
    this.setState({
      selectedOperator,
      selectedValueType: valueType,
      disableValueField: valueFieldDisable
    })
  }

  onChangeValue = (selectedValue) => {
    this.setState({
      selectedValue
    })
  }

  onChangeAllCriteria = (e) => {
    this.setState({
      allCriteria: e.target.checked,
      anyCriteria: !e.target.checked
    })
  }

  onChangeAnyCriteria = (e) => {
    this.setState({
      anyCriteria: e.target.checked,
      allCriteria: !e.target.checked
    })
  }

  // Validates LeftSide Query Builder value field
  onClickValidateFormFields = (operatorValue) => {
    let validationError = {};
    const { leftQBuilderForm } = this.refs;
    const formValues = leftQBuilderForm.getFormValues();
    if (operatorValue !== 'between' && !formValues["valueField"]) {
      validationError["valueField"] = "Value is Required"
    } else if (!formValues["firstDate"] && operatorValue === 'between') {
      validationError["firstDate"] = "Value is Required"
    } else if (!formValues["lastDate"] && operatorValue === 'between') {
      validationError["firstDate"] = "Value is Required"
    }
    this.setState({ validationErrors: validationError })
    return validationError;
  }

  // Set Left Side Query Builder value on the Basic of operator type and Column Type
  setLeftQueryFormValue = (columnType, operatorValue) => {
    let value = '';
    if (columnType === 'date' && operatorValue !== 'between') {
      const { leftQBuilderForm } = this.refs;
      const formValues = leftQBuilderForm.getFormValues();
      value = formValues["valueField"];
      value = moment(value).format('YYYY-MM-DD');
    } else if (columnType !== 'date' && operatorValue.includes('exists', 'not_exists')) {
      value = operatorValue
    } else if (columnType === 'date' && operatorValue === 'between') {
      const { leftQBuilderForm } = this.refs;
      const formValues = leftQBuilderForm.getFormValues();
      const firstDate = moment(formValues["firstDate"]).format('YYYY-MM-DD');
      const lastDate = moment(formValues["lastDate"]).format('YYYY-MM-DD');
      value = firstDate + ' to ' + lastDate
    } else {
      const { leftQBuilderForm } = this.refs;
      const formValues = leftQBuilderForm.getFormValues();
      value = formValues["valueField"];
    }
    const selectedValue = {
      label: value,
      value: value
    }
    return selectedValue
  }

  setOperatorEmpty = () => {
    this.setState({
      selectedOperator: {
        label: '',
        value: ''
      }
    })
  }

  onClickResetCriteria = () => {
    const { selectedOperator } = this.state;
    const operatorValue = selectedOperator.value
    let leftQBuilderForm = {}
    if (operatorValue && !operatorValue.includes('exists', 'not_exists')) {
      leftQBuilderForm = this.refs.leftQBuilderForm;
    }
    this.setState({
      selectedColumn: {},
      selectedOperator: (operatorValue && !operatorValue.includes('exists', 'not_exists')) ? {} : { value: operatorValue, label: operatorValue },
      selectedValue: {},
      startDate: '',
      initialValue: {},
      disableValueField: false
    }, (operatorValue && !operatorValue.includes('exists', 'not_exists')) ? leftQBuilderForm.emptyFormValues({}) : this.setOperatorEmpty);
  }

  onClickAddCriteria = () => {
    const { selectedColumn, selectedOperator } = this.state;
    let searchCriteria = {}
    const validationError = {}
    let leftQBuilderForm = {}
    const operatorValue = selectedOperator.value
    let isFormValid = {}
    if (!operatorValue.includes('exists', 'not_exists')) {
      isFormValid = this.onClickValidateFormFields(operatorValue)
    }
    if (Object.getOwnPropertyNames(isFormValid).length === 0) {
      const columnType = selectedColumn.type
      const selectedValue = this.setLeftQueryFormValue(columnType, operatorValue)
      if (!operatorValue.includes('exists', 'not_exists')) {
        leftQBuilderForm = this.refs.leftQBuilderForm;
      }
      if (selectedColumn.label && selectedOperator.label) {
        searchCriteria = {
          selectedColumn,
          selectedOperator,
          selectedValue
        }
      }
      let searchCriterias = [...this.state.searchCriterias, searchCriteria];
      searchCriterias = remove(searchCriterias, (criteria) => { return !isEmpty(criteria); });

      this.setState({
        searchCriterias,
        selectedColumn: {},
        selectedOperator: (!operatorValue.includes('exists', 'not_exists')) ? {} : { value: operatorValue, label: operatorValue },
        selectedValue: {},
        startDate: '',
        initialValue: {}
      }, (!operatorValue.includes('exists', 'not_exists')) ? leftQBuilderForm.emptyFormValues({}) : this.setOperatorEmpty);
    }
  }

  setDateInitialVal = (val) => {
    const date = (moment(val).toDate());
    return moment(date).format("YYYY-MM-DD")
  }

  onClickEditCriteria = (idx, criteria) => {
    let value = ''
    let initialValues = {}
    if (criteria.selectedColumn.type === 'date' && criteria.selectedOperator.value !== 'between') {
      value = this.setDateInitialVal(criteria.selectedValue.value)
      initialValues = {
        "valueField": value
      }
    } else if (criteria.selectedColumn.type === 'date' && criteria.selectedOperator.value === 'between') {
      const splitedDate = (criteria.selectedValue.value).split('to')
      const firstDate = this.setDateInitialVal(splitedDate[0])
      const lastDate = this.setDateInitialVal(splitedDate[1])
      initialValues = {
        "firstDate": firstDate,
        "lastDate": lastDate
      }
    } else {
      value = criteria.selectedValue.value
      initialValues = {
        "valueField": value
      }
    }

    this.setState({
      selectedColumn: criteria.selectedColumn,
      operatorOptions: criteria.selectedColumn.operators,
      selectedOperator: criteria.selectedOperator,
      selectedValue: criteria.selectedValue,
      initialValue: initialValues
    })
  }

  onClickDeleteCriteria = (idx, criteria) => {
    this.setState(prevState => ({
      searchCriterias: prevState.searchCriterias.filter((el, elidx) => elidx !== idx)
    }))
  }

  onClickSearch = () => {
    const { searchCriterias, allCriteria, anyCriteria, startDate } = this.state
    const { modelName } = this.props;
    const conditionType = anyCriteria == true ? "$or" : "$and";
    const searchBuilder = [];
    searchCriterias.map((data) => {
      searchBuilder.push({
        selectedColumn: data.selectedColumn.dataField,
        selectedOperator: data.selectedOperator.value,
        selectedValue: data.selectedValue.value != undefined ? data.selectedValue.value.trim() : ''
      })
    })

    this.props.loadData({ conditionType, searchBuilder });
    /**Close the advance search modal window after clicking on search  */
    this.hide()
  }

  /** Saves the query as Favourite for the corresponding user */
  onClickSaveAsFavourite = () => {
    this.refs.quickFilterView.show();
  }

  hide = () => {
    let { hideAdvanceSearchModal } = this.props
    hideAdvanceSearchModal();
    this.setState({
      viewAdvanceSearchModal: false
    })
    this.getFavouriteFilter(true)
  }

  show = () => {
    this.setState({
      viewAdvanceSearchModal: true
    })
    this.getFavouriteFilter(false)
  }
  /** Build Left Side query Value field according to the operator selected */
  buildSection = () => {
    const { selectedColumn, selectedValueType, initialValue, validationErrors } = this.state;
    const { options } = selectedColumn || {};
    let { type } = selectedColumn
    let valueFields = []

    if (selectedValueType === 'textarea') {
      type = selectedValueType
      valueFields = [{
        type: type,
        name: 'valueField',
        options: options
      }];
    } else if (selectedValueType === 'between') {
      valueFields = [{
        type: type || 'text',
        name: 'firstDate',
        options: options
      }, {
        type: type || 'text',
        name: 'lastDate',
        options: options
      }]
    } else if (type === 'string') {
      valueFields = [{
        type: 'text',
        name: 'valueField',
        options: options
      }];
    }
    else {
      valueFields = [{
        type: type || 'text',
        name: 'valueField',
        options: options
      }];
    }

    return <FormBuilder
      ref="leftQBuilderForm"
      fields={valueFields}
      initialValues={this.state.initialValue}
      validationErrors={validationErrors}
      cols={1}
    />
  }

  handleTabSelect = eventKey => {
    this.setState({ selectedTab: eventKey });
  };

  /** Edits Favourite Filter options */
  onClickEditFavouriteFilter = (criteria) => {
    this.setState({
      selectedTab: 1,
      searchCriterias: criteria.query
    })
  }

  /** Deletes Favourite Filter Options */
  onClickDeleteFavouriteFilter = async (query) => {
    const { gridId, user } = this.props;
    const emailId = user.email
    const isRemove = await removeFavouriteFilter(query, gridId, emailId)
    if (isRemove) {
      await this.getFavouriteFilter() // In Advance Search Modal update the Favourite Query in Favourite Search view
      this.props.loadFavouriteFilter() // Update the Favourite Search option in Byjus Grid
    }
  }

  /** Renders Favourite Search View List */
  renderFavouriteSearchedView = () => {
    const { searchCriteriasOptions } = this.state;
    return (
      searchCriteriasOptions.map((optn, index) => {
        return (
          <Fragment>
            <Row>
              <Col md={9}>
                <Row>
                  <Col md={6}>
                    {optn.name} {'  '}
                  </Col>
                  <Col md={3}>
                    <i className="fa fa-edit" onClick={() => this.onClickEditFavouriteFilter(optn)}>
                    </i>{'  '}
                    <i className="fa fa-trash" onClick={() => this.onClickDeleteFavouriteFilter(optn)}>
                    </i></Col>
                </Row>
              </Col>
            </Row>
          </Fragment>
        )
      })
    )
  }

  renderAdvanceSearchView = () => {
    const { selectedColumn, selectedOperator, selectedValue, selectedTab } = this.state;
    const { columnOptions, operatorOptions, searchCriterias, selectedValueType, isSelectOption, disableValueField } = this.state;
    const { gridId } = this.props;

    return (
      <Fragment>
        <h5 className="subtitle">Select Search Criteria</h5>
        <div className="qpane-wrapper">
          <div className="qpane-left">
            <FormGroup>
              <Select
                value={selectedColumn ? selectedColumn.value : null}
                placeholder="Column"
                onChange={this.onChangeColumn}
                options={columnOptions}
              />
            </FormGroup>
            <FormGroup>
              <Select
                value={selectedOperator ? selectedOperator.value : null}
                placeholder="Operator"
                onChange={this.onChangeOperator}
                options={operatorOptions}
              />
            </FormGroup>
            <FormGroup>
              {!disableValueField && this.buildSection()}
            </FormGroup>
            <div>
              <Button color="primary" onClick={this.onClickAddCriteria}>
                <i className="fa fa-plus"></i> Add
                    </Button>{' '}
              <Button color="danger" onClick={this.onClickResetCriteria}>
                <i className="fa fa-refresh"></i> Reset
                    </Button>
            </div>
          </div>
          <div className="qpane-right">
            <section className="qpane-sc-header">
              <span className="subtitle">Search for records that match</span>
              <FormGroup tag="fieldset" style={{ display: 'inline', marginLeft: '20px' }}>
                <FormGroup check style={{ display: 'inline' }}>
                  <Label check>
                    <Input type="radio" name="radioGroup" value="any_criteria" checked={this.state.anyCriteria} onChange={this.onChangeAnyCriteria} />{' '}
                    Any Criteria
                        </Label>
                </FormGroup>{' '}
                <FormGroup check style={{ display: 'inline' }}>
                  <Label check>
                    <Input type="radio" name="radioGroup" value="all_criteria" checked={this.state.allCriteria} onChange={this.onChangeAllCriteria} />{' '}
                    All Criteria
                        </Label>
                </FormGroup>{' '}
              </FormGroup>
            </section>
            <section className="qpane-sc-body">
              {
                searchCriterias.length > 0 &&
                searchCriterias.map((searchCriteria, idx) => {
                  return (
                    <div className="search-criteria" key={idx}>
                      {searchCriteria && searchCriteria.selectedColumn ?
                        <Fragment>
                          {searchCriteria.selectedColumn.label}{' '}
                          {searchCriteria.selectedOperator.label}{' '}
                          {searchCriteria.selectedValue.value}{' '}
                          <span className="pull-right sc-icons">
                            <i className="fa fa-edit"
                              onClick={() => this.onClickEditCriteria(idx, searchCriteria)}>
                            </i>{' '}
                            <i
                              className="fa fa-trash"
                              onClick={() => this.onClickDeleteCriteria(idx, searchCriteria)}>
                            </i>
                          </span>
                        </Fragment> :
                        null}
                    </div>
                  )
                })
              }
              {
                searchCriterias.length == 0 &&
                <div className="no-search-criteria">No Search Criteria is Selected</div>
              }
            </section>
          </div>
        </div>
        <div className="text-right">
          <Button color="primary" disabled={searchCriterias.length == 0} onClick={this.onClickSearch}>
            <i className="fa fa-search-plus"></i> Search
            </Button>{' '}
          <Button color="primary" disabled={searchCriterias.length == 0 || gridId === undefined || gridId === ''} onClick={this.onClickSaveAsFavourite}>
            <i className="fa fa-star"></i> Save as Quick Filter
            </Button>{' '}
          <Button color="danger" onClick={this.hide}>
            <i className="fa fa-close"></i> Cancel
            </Button>
        </div>
      </Fragment>
    )
  }

  renderForm() {
    const tabs = [{
      title: 'Advance Search View',
      component: this.renderAdvanceSearchView()
    }, {
      title: 'Favourite Search View',
      component: this.renderFavouriteSearchedView()
    }]
    return (
      <Box type="warning" className="border-0">
        <BoxBody>
          <TabBuilder tabs={tabs} onSelect={this.handleTabSelect} />
        </BoxBody>
      </Box>
    )
  }

  favouriteFilter = () => {
    this.props.loadFavouriteFilter()
  }

  render() {
    const { searchCriterias } = this.state
    const { gridId, user, className } = this.props;
    const emailId = user.email;
    const classes = classNames("modal-info", "byjus-advance-search");

    return (
      <Fragment>
        <Modal
          size="lg"
          backdrop={false}
          keyboard={true}
          isOpen={this.state.viewAdvanceSearchModal}
          toggle={this.hide}
          backdrop={true}
          className={classes}
        >
          <ModalHeader
            toggle={this.hide}
            className="modal-colored-header bg-primary"
          >
            Advance Search
          </ModalHeader>
          <ModalBody>
            {this.renderForm()}
          </ModalBody>
        </Modal>
        <FavouriteSearchModal
          ref="quickFilterView"
          searchCriterias={searchCriterias}
          gridId={gridId}
          loadFavouriteFilterData={this.getFavouriteFilter}
          emailId={emailId}
          updateFavouriteFilter={this.getFavouriteFilter}
        />
      </Fragment>
    )
  }
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(AdvanceSearch);
