import React, { Component, Fragment } from "react";
import P from 'prop-types';
import { get, size, isEmpty, remove, isEqual, concat, sortBy, find } from "lodash";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

import ErrorWrapper from 'components/error/ErrorWrapper';
import LoadingWrapper from "components/LoadingWrapper";
import { callApi } from "store/middleware/api";

import AdvanceSearch from "../advancesearch/AdvanceSearch";
import QuickSearch from "../quicksearch/QuickSearch";
import Toolbar from './Toolbar';
import GridSummary from './GridSummary';

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "./ByjusGrid.css";

class ByjusGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      pills: [],
      loading: false,
      loadError: null,
      noDefaultLoad: false,
      sort: {},
      contextCriterias: [],
      searchCriterias: [],
      gridDataUrl: '',
      docs: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      options: {},
      showAdvanceSearchModal: false,
      isAdvanceSearchApplied: false
    };
  }

  componentWillMount() {
    /**Use defaultNode props to avoid automatic loading of grid */
    let { columns = [], gridDataUrl, simpleGrid, sort, noDefaultLoad, pillOptions = {},
      contextCriterias, modelName = "", refresh = false, summaryApiConfig } = this.props;

    const urlSuffix = modelName.toLowerCase();
    /**If noDefaultLoad is not passed, load the grid */
    noDefaultLoad = noDefaultLoad || this.state.noDefaultLoad;
    remove(contextCriterias, n => isEmpty(n));

    this.setState({
      columns, sort, noDefaultLoad,
      contextCriterias,
      gridDataUrl: gridDataUrl || `/${urlSuffix}/list`,
      summaryApiConfig
    }, () => {
      //If it is not simpleGrid OR defaultLoad is false OR if pills exists as well don't load the data
      if (!simpleGrid && !noDefaultLoad && size(pillOptions.pills) === 0) {
        this.loadData(this.state);
      }
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.columns != nextProps.columns) {
      this.setState({ columns: nextProps.columns });
    }

    if (this.props.gridDataUrl != nextProps.gridDataUrl) {
      this.setState({ gridDataUrl: nextProps.gridDataUrl }, () => { this.loadData(this.state); });
    }

    if (this.props.noDefaultLoad != nextProps.noDefaultLoad) {
      this.setState({
        noDefaultLoad: nextProps.noDefaultLoad
      });
    }

    if (!isEqual(this.props.searchCriterias, nextProps.searchCriterias)) {
      //this.setState({ searchCriterias: nextProps.searchCriterias });
      this.loadData(nextProps);
    }

    if (this.state.page != nextState.page ||
      this.state.sort != nextState.sort ||
      //!isEqual(this.props.searchCriterias, nextProps.searchCriterias) ||
      // this.state.contextCriterias != nextState.contextCriterias ||
      !isEqual(this.state.contextCriterias, nextState.contextCriterias) ||
      this.state.sizePerPage != nextState.sizePerPage || (!this.props.refresh && nextProps.refresh)) {
      /**Update context criteria whenever filters gets updated */
      //nextState.contextCriterias = nextState.filters || [];
      this.loadData(nextState);
    }
  }

  onSortChange = (sortName, sortOrder) => {
    let sort = {};

    if (sortName && sortOrder) {
      sort = {
        [sortName]: sortOrder
      };
    }

    this.setState({ sort });
  }

  onPageChange = (page, sizePerPage) => {
    this.setState({ page, sizePerPage });
  }

  loadData = async (state) => {
    const { modelName, dbName, populate, select, onLoadDataCompletion, gridId } = this.props;
    let { contextCriterias, searchCriterias, gridDataUrl: apiUrl, viewName } = state || {};

    remove(contextCriterias, n => isEmpty(n));
    let bodyPayload = {
      gridId,
      model: modelName,
      db: dbName,
      page: (state.page || 1),
      limit: state.sizePerPage || 10,
      populate,
      contextCriterias,
      searchCriterias,
      select,
      sort: state.sort || {}
    };

    this.setState({ loading: true });
    try {
      const apiResponse = await callApi(apiUrl, "POST", bodyPayload, null, null, true);
      const { gridConfig, docs, total } = apiResponse;
      const viewDetails = find(gridConfig, { 'viewFormattedName': viewName || 'all' });
      const remoteColumns = viewDetails && get(viewDetails, 'columns', '') || get(gridConfig, '0.columns');
      const stateToUpdate = {
        loading: false,
        docs: docs,
        totalSize: total,
        loadError: null,
        gridConfig
      };

      /*if (remoteColumns) {
        const finalViews = gridConfig && gridConfig.map(gridView => {
          return {
            ...gridView,
            title: gridView.viewName,
          };
        });
        const finalPills = finalViews ? finalViews : get(this.props, 'pillOptions.pills', []);
        stateToUpdate["columns"] = this.computeFinalColumns(remoteColumns);
        stateToUpdate["pills"] = finalPills;
      }*/

      this.setState(stateToUpdate);

      onLoadDataCompletion && onLoadDataCompletion(state, apiResponse);
    }
    catch (error) {
      this.setState({
        loading: false,
        loadError: error
      });
      onLoadDataCompletion && onLoadDataCompletion(state, undefined);
    }
  }

  computeFinalColumns = (columns) => {
    const { formatters = {}, extraColumns } = this.props;
    const formattedColumns = columns.map((column, idx) => {
      return {
        position: idx + 1,
        ...column,
        formatter: formatters[column.formatter]
      }
    });
    const mergedColumns = extraColumns ? concat(formattedColumns, extraColumns) : formattedColumns;
    const finalColumns = sortBy(mergedColumns, ['position']);

    return finalColumns;
  }

  onClickRefresh = () => {
    const { summaryGridRef } = this.refs;

    this.loadData(this.state);

    /**If summary grid ref is available then call reload  */
    summaryGridRef && summaryGridRef.reloadSummaryData && summaryGridRef.reloadSummaryData();
  }

  renderShowsTotal = (from, to, size) => {
    return (
      <Fragment>
        <span className="react-bootstrap-table-pagination-total">
          &nbsp;&nbsp;Showing {from} to {to} of {size} Results
        </span>{" "}
      </Fragment>
    );
  }

  isExpandableRow = row => {
    return true;
  }

  loadWithAdvanceSearch = (searchCriterias) => {
    this.setState({
      isAdvanceSearchApplied: true,
      searchCriterias,
      page: 1
    }, () => {
      this.loadData(this.state);
    });
  }

  clearAdvanceSearch = () => {
    this.setState({
      page: 1,
      isAdvanceSearchApplied: false,
      searchCriterias: [],
      showAdvanceSearchModal: false
    }, () => {
      this.loadData(this.state);
    });
  }

  showAdvanceSearchModal = () => {
    this.setState({
      showAdvanceSearchModal: true
    });
  }

  hideAdvanceSearchModal = () => {
    this.setState({
      showAdvanceSearchModal: false
    });
  }

  handlePillChanges = (eventKey, pills) => {
    const { pillOptions = {}, contextCriterias: commonContextCriteria = [] } = this.props;

    const onPillChange = pillOptions && pillOptions.onPillChange;
    const selectedPill = pills && pills[eventKey - 1];

    if (selectedPill) {
      const { contextCriterias = [], columns } = selectedPill;
      const stateToUpdate = {
        selectedPill: eventKey,
        page: 1,
        viewName: get(selectedPill, 'viewFormattedName'),
        contextCriterias: [...contextCriterias, ...commonContextCriteria]
      };
      if (columns && columns.length > 0) {
        stateToUpdate["columns"] = this.computeFinalColumns(columns);
      }
      /**Store selectedPill and contextCiteria in state */
      this.setState(stateToUpdate);
    }
    /**if onPillChnage filtion passed as prop execute it by passing selected pill and index */
    onPillChange && onPillChange(selectedPill, eventKey);
  }

  handleSelectChanges = (name, value) => {
    this.setState({ [name]: value });
  }

  getGridConfig = () => {
    const { expandRow, simpleGrid, paginationPosition, renderShowsTotal, compactView, sizePerPageList } = this.props;
    const { page, sizePerPage } = this.state;
    /**
     * Expand options
     * Note : Spread all the expand options only if the expandRow function is available otherwise skip those props
     */
    const expandColumnVisible = expandRow ? true : false;
    const expandOptions = expandRow ?
      {
        expandableRow: this.isExpandableRow,
        expandComponent: expandRow,
        expandColumnOptions: {
          expandColumnVisible
        }
      } :
      {};
    /**
     * Bootstrap grid options and events
     */
    const options = simpleGrid ?
      {} :
      {
        page,
        sizePerPage,
        sizePerPageList,
        showTotal: true,
        noDataText: 'There is no data to display',
        paginationPosition: paginationPosition || "bottom",
        paginationSize: compactView ? 1 : 5,
        paginationShowsTotal: compactView ? null : this.renderShowsTotal,
        onSortChange: this.onSortChange,
        onPageChange: this.onPageChange,
        expandBy: "column", // Currently, available value is row and column, default is row
        expandRowBgColor: "rgb(232, 232, 229)"
      };
    const remote = simpleGrid ? false : true;
    const pagination = simpleGrid ? false : true;
    const data = simpleGrid ? this.props.data : this.state.docs;
    return {
      expandOptions,
      options,
      remote,
      pagination,
      data
    };
  }

  /**
   * Render React bootstrap table
   */
  renderGrid = () => {
    const { expandOptions, options, remote, pagination, data } = this.getGridConfig();
    const { selectRow, handleCellEdit, headerClass, compactView, bodyContainerClass } = this.props;
    const { totalSize, columns } = this.state;

    return (
      <>
        {columns.length > 0 &&
          <BootstrapTable
            data={data}
            remote={remote}
            pagination={pagination}
            striped={true}
            hover={true}
            condensed={true}
            options={options}
            fetchInfo={{ dataTotalSize: totalSize }}
            {...expandOptions}
            selectRow={selectRow}
            version='4'
            cellEdit={{
              mode: 'click',
              blurToSave: true,
              afterSaveCell: handleCellEdit
            }}
            headerContainerClass={`${headerClass} ${compactView ? 'd-none' : ''}`}
            bodyContainerClass={bodyContainerClass}
          >
            {
              columns.map((column, idx) => {
                const isNested = column.dataField.indexOf(".") >= 0;
                const formatter = isNested
                  ? function (cell, row) {
                    return get(row, column.dataField);
                  }
                  : undefined;
                return (
                  <TableHeaderColumn
                    isKey={idx == 0 ? true : false}
                    dataField={column.dataField}
                    width={column.width ? String(column.width) : "200px"}
                    dataSort={column.sort === false ? false : true}
                    dataFormat={column.formatter || formatter}
                    hidden={column.hidden === true ? true : false}
                    key={idx}
                    hidden={column.hidden || false}
                    className={column.className}
                    columnClassName={column.columnClassName}
                    editable={column.editor ? column.editor : false}
                  >
                    {column.editor && (<i className="fa fa-pencil" style={{ float: "left", marginTop: "5%", marginRight: "2%" }} />)}
                    {column.text}
                  </TableHeaderColumn>
                );
              })}
          </BootstrapTable>
        }
      </>
    )
  }

  /**
   * Render quick filters if there are anything configured
   */
  renderQuickFilters = (columns) => {
    return (
      <QuickSearch columns={columns} />
    )
  }

  /**
   * Render main function
   */
  render() {
    const { loading, loadError, columns, showAdvanceSearchModal, filters, selectedPill, pills } = this.state;
    const { pillOptions = {}, modelName, gridId, error, summaryApiConfig, addOnQfColumns = [] } = this.props;

    /**If pills are coming from  config then take it else take pillOptions.pills only */
    const finalPills = isEmpty(pills) ? get(pillOptions, 'pills', []) : pills;

    return (
      <>
        {summaryApiConfig && <GridSummary
          ref={"summaryGridRef"}
          summaryApiConfig={summaryApiConfig}
        />}
        <ErrorWrapper error={error || loadError} errorTop={true}>
          <LoadingWrapper loading={loading}>
            {columns.length > 0 &&
              <Fragment>
                <Toolbar
                  {...this.props}
                  pillOptions={{
                    ...pillOptions,
                    pills: finalPills
                  }}
                  selectedPill={selectedPill}
                  functions={{
                    onClickRefresh: this.onClickRefresh,
                    showAdvanceSearch: this.showAdvanceSearchModal,
                    clearAdvanceSearch: this.clearAdvanceSearch,
                    onClickQuickSearch: this.onClickQuickSearch,
                    loadData: this.loadWithAdvanceSearch,
                    handlePillChanges: this.handlePillChanges
                  }} />
                {this.renderGrid()}
                {showAdvanceSearchModal && <AdvanceSearch
                  ref="advanceSearch"
                  searchCriterias={filters}
                  columns={columns}
                  loadData={this.loadWithAdvanceSearch}
                  modelName={modelName}
                  gridId={gridId}
                  hideAdvanceSearchModal={this.hideAdvanceSearchModal}
                />}
              </Fragment>
            }
          </LoadingWrapper>
        </ErrorWrapper>
      </>
    );
  }
}

ByjusGrid.propTypes = {
  columns: P.arrayOf(P.shape({
    text: P.string.isRequired,
    dataField: P.string.isRequired,
    sort: P.bool
  })),
  compactView: P.bool,
  tableContainerClass: P.string
}

export default ByjusGrid;