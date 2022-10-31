import React, { useEffect, Fragment, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { get, isEmpty, remove, isEqual, snakeCase, concat, sortBy, find, merge, isArray, isObject } from "lodash";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import queryString from 'query-string';

import ErrorWrapper from 'components/error/ErrorWrapper';
import LoadingWrapper from "components/LoadingWrapper";
import { callApi } from "store/middleware/api";
import AdvanceSearch from "modules/core/components/advancesearch/AdvanceSearch";
import QuickSearch from "../quicksearch/QuickSearch";
import EasySearchModal from "modules/core/components/easysearch/EasySearchModal";
import Toolbar from './ToolbarV2';

import defaultFormatters from './columnFormatters'

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "./ByjusGrid.css";

/**
    Custom hooks for comparing prevState and currentState value during rerendering
 */
const usePrevious = (value) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function existingQueryParams() {
    const qParams = queryString.parse(window.location.search);

    return {
        ...qParams,
        page: qParams.page ? Number(qParams.page) : 1,
        sizePerPage: qParams.sizePerPage ? Number(qParams.sizePerPage) : 10,
        viewName: qParams.viewName || 'all',
        viewId: qParams.viewId,
        searchCriteria: qParams.searchCriteria
    };
}

function getSearchQueryParams() {
    //Block for building search query params to searchCriterias
    const { searchCriterias } = existingQueryParams();
    const dSearchCriterias = searchCriterias && JSON.parse(searchCriterias);
    const fSearchCriterias = [];
    searchCriterias && Object.keys(dSearchCriterias).forEach((key) => {
        const selectedValue = dSearchCriterias[key];
        /**For object filter for a column like- $exists,$gte,$lte,$ne,$eq */
        if (isObject(selectedValue) && !isArray(selectedValue)) {
            fSearchCriterias.push(selectedValue)
        }
        else if (selectedValue.includes('TO')) {
            const valuesArr = selectedValue.split('TO');
            fSearchCriterias.push({
                selectedColumn: key,
                selectedOperator: "greater_than_equals_to",
                selectedValue: Number(valuesArr[0])
            }, {
                selectedColumn: key,
                selectedOperator: "less_than_equals_to",
                selectedValue: Number(valuesArr[1])
            });
        }
        else {
            const operator = isArray(selectedValue) ? "in" : "equal";
            fSearchCriterias.push({
                selectedColumn: key,
                selectedOperator: key.includes("At") ? 'between' : operator,
                selectedValue
            });
        }
    });
    if (fSearchCriterias.length > 0) {
        return {
            conditionType: "$and",
            searchBuilder: fSearchCriterias
        };
    }
    return;
}

const changeSearchQueryParams = (searchCriterias) => {
    const msearchCriterias = searchCriterias;
    Object.keys(msearchCriterias.searchBuilder).forEach((key) => {
        const selectedObject = msearchCriterias.searchBuilder[key];
        const operator = isArray(selectedObject.selectedValue) ? "in" : "equal";
        selectedObject.selectedOperator = key.includes("At") ? 'between' : operator
    })
    return msearchCriterias;
};

const ByjusGrid = (props, ref) => {
    const { modelName, gridId, error, filters, hideSearchModals } = props;
    const urlSuffix = modelName && modelName.toLowerCase() || '';
    let eQueryParams = existingQueryParams();
    let gridCriterias = get(props, 'contextCriterias', []).filter((ele => !isEmpty(ele)));
    const [columns, setColumns] = useState(props.columns || []);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [sort, setSort] = useState(props.sort || {});
    const [contextCriterias, setContextCriterias] = useState(gridCriterias);
    const [searchCriterias, setSearchCriterias] = useState([]);
    const [gridDataUrl, setGridDataUrl] = useState(props.gridDataUrl || `/${urlSuffix}/list`);
    const [docs, setDocs] = useState([]);
    const [page, setPage] = useState(eQueryParams.page || 1);
    const [sizePerPage, setSizePerPage] = useState(eQueryParams.sizePerPage || props.sizePerPage || 10);
    const [pillOptions, setPillOptions] = useState(props.pillOptions);
    const [viewName, setViewName] = useState(eQueryParams.viewName);
    const [totalSize, setTotalSize] = useState(0);
    const [config, setConfig] = useState({})
    //const [options, setOptions] = useState({});
    //const [noDefaultLoad, setNoDefaultLoad] = useState(props.noDefaultLoad || false);
    const [showAdvanceSearchModal, setShowAdvanceSearchModal] = useState(false);
    const [showEasySearchModal, setShowEasySearchModal] = useState(false);
    const prevState = usePrevious({ columns, page, sort, gridDataUrl, sizePerPage, docs, searchCriterias, contextCriterias }) || {};

    useEffect(() => {
        let updatedColumns = props.columns;
        if (isEmpty(props.columns)) {
            const viewDetails = find(config, { 'viewFormattedName': 'all' });
            updatedColumns = viewDetails && get(viewDetails, 'columns', '') || get(config, '0.columns') || [];
        }
        updatedColumns = computeFinalColumns(updatedColumns);
        setColumns(updatedColumns);
    }, [props.columns])

    useEffect(() => {
        if (props.searchCriterias && get(props, 'searchCriterias.searchBuilder')) {
            setSearchCriterias(props.searchCriterias)
        }
    }, [props.searchCriterias])

    useEffect(() => {
        if (props.gridDataUrl) {
            setGridDataUrl(props.gridDataUrl);
        }
    }, [props.gridDataUrl])

    useEffect(() => {
        let allowLoadData = true
        if (!isEmpty(prevState) && !isEqual(columns, prevState.columns)) {
            setColumns(columns);
        }

        if (!isEmpty(prevState) && gridDataUrl != prevState.gridDataUrl) {
            if (page !== 1) {
                onPageChange(1, sizePerPage)
                allowLoadData = false
            }
            setGridDataUrl(gridDataUrl);
        }

        if (!isEmpty(prevState) && !isEqual(searchCriterias, prevState.searchCriterias)) {
            setSearchCriterias(searchCriterias);
        }

        if (!isEmpty(prevState) && !isEqual(contextCriterias, prevState.contextCriterias)) {
            setContextCriterias(contextCriterias);
        }

        const changeInSearchCriterias = !isEmpty(prevState) && (
            (searchCriterias && !isEqual(searchCriterias, prevState.searchCriterias))
        )
        if (
            prevState && allowLoadData && (
                page != prevState.page ||
                sizePerPage != prevState.sizePerPage ||
                (sort && !isEqual(sort, prevState.sort)) ||
                (contextCriterias && !isEqual(contextCriterias, prevState.contextCriterias)) ||
                changeInSearchCriterias ||
                (gridDataUrl && !isEqual(gridDataUrl, prevState.gridDataUrl))
            )
        ) {
            loadData({ autoSelect: changeInSearchCriterias });
        }
    }, [columns, gridDataUrl, props.gridDataUrl, searchCriterias, props.searchCriterias, contextCriterias, props.contextCriterias, page, sort, sizePerPage])

    useImperativeHandle(ref, () => ({
        refreshGrid() {
            loadData();
        }
    }))

    const onSortChange = (sortName, sortOrder) => {
        let sort = {};

        if (sortName && sortOrder) {
            sort = {
                [sortName]: sortOrder
            };
        }
        setSort(sort);
    }

    const onPageChange = (page, sizePerPage) => {
        const eQueryParams = existingQueryParams();

        const qParams = "?" + queryString.stringify({
            ...eQueryParams,
            page: page || 1,
            sizePerPage: sizePerPage || 10,
            viewName: eQueryParams.viewName,
            viewId: eQueryParams.viewId,
            searchCriteria: eQueryParams.searchCriteria
        }).toString();

        window.history.replaceState(null, null, qParams);
        setPage(page);
        setSizePerPage(sizePerPage);
    }

    const loadData = async (options) => {
        const qParams = existingQueryParams();
        const { modelName, gridId, dbName, populate, select, onLoadDataCompletion } = props;
        let finalSearchCriterias;

        if (get(searchCriterias, 'searchBuilder', []).length > 0) {
            finalSearchCriterias = searchCriterias;
        }
        else {
            finalSearchCriterias = getSearchQueryParams();
        }

        remove(contextCriterias, n => isEmpty(n));
        let bodyPayload = {
            gridId: gridId,
            viewName: qParams.viewName,
            viewId: qParams.viewId,
            model: modelName,
            db: dbName,
            populate: populate,
            page: page || 1,
            limit: sizePerPage || 10,
            contextCriterias,
            searchCriterias: finalSearchCriterias,
            sort: sort || {},
            select: select
        };

        try {
            setLoading(true);
            const apiResponse = await callApi(gridDataUrl, "POST", bodyPayload, null, null, true);
            setLoading(false);
            const { gridConfig } = apiResponse;
            const viewDetails = find(gridConfig, { 'viewFormattedName': qParams.viewName || 'all' });
            const remoteColumns = viewDetails && get(viewDetails, 'columns', '') || get(gridConfig, '0.columns');

            const finalColumns = computeFinalColumns(props.columns || remoteColumns);
            setColumns(finalColumns);

            const finalViews = gridConfig && gridConfig.map(gridView => {
                return {
                    ...gridView,
                    title: gridView.viewName,
                };
            });
            const finalPills = get(props, 'pillOptions.pills', finalViews);
            setPillOptions({
                ...pillOptions,
                pills: finalPills
            })

            setDocs(apiResponse.docs);
            setTotalSize(apiResponse.total);
            setConfig(gridConfig);
            setLoadError(null);
            onLoadDataCompletion && onLoadDataCompletion(options, apiResponse);
        }
        catch (e) {
            setLoading(false);
            setLoadError(e);
            onLoadDataCompletion && onLoadDataCompletion(options, undefined);
        }
    }

    const computeFinalColumns = (columns) => {
        const { formatters = {}, extraColumns } = props;
        const columnFormatters = { ...defaultFormatters, ...formatters };
        const formattedColumns = columns.map((column, idx) => {
            let formatter;
            if (column.formatter) {
                formatter = typeof column.formatter === 'string' ? columnFormatters[column.formatter] : column.formatter;
            }
            return {
                position: idx + 1,
                ...column,
                formatter
            }
        });
        const mergedColumns = extraColumns ? concat(formattedColumns, extraColumns) : formattedColumns;
        const finalColumns = sortBy(mergedColumns, ['position']);

        return finalColumns;
    }

    const onClickRefresh = () => {
        loadData();
    }

    const renderShowsTotal = (from, to, size) => {
        return (
            <Fragment>
                <span className="react-bootstrap-table-pagination-total">
                    &nbsp;&nbsp;Showing {from} to {to} of {size} Results
                </span>{" "}
            </Fragment>
        );
    }

    const isExpandableRow = () => {
        return true;
    }

    const loadWithAdvanceSearch = (searchCriterias) => {
        setPage(1);
        setSearchCriterias(searchCriterias);
    }

    const clearAdvanceSearch = () => {
        setPage(1);
        setShowAdvanceSearchModal(false);
        setSearchCriterias([]);
    }

    const handlePillChanges = (eventKey, pills) => {
        const { pillOptions = {}, contextCriterias: commonContextCriteria = [] } = props;
        const onPillChange = pillOptions && pillOptions.onPillChange;
        const selectedPill = pills && pills[eventKey - 1];
        const formattedViewName = snakeCase(get(selectedPill, 'title'));
        const formattedViewId = get(selectedPill, '_id');
        const eQueryParams = existingQueryParams();

        if (selectedPill) {
            let { contextCriterias } = selectedPill;
            /**If the pill context criteria is empty, pass the default criteria [{}] so that the grid will load initially */
            if (isEmpty(contextCriterias)) contextCriterias = [];
            /**Store selectedPill and contextCiteria in state */
            setViewName(formattedViewName);
            setContextCriterias([...contextCriterias, ...commonContextCriteria]);
        }

        const qParams = "?" + queryString.stringify({
            ...eQueryParams,
            page: eQueryParams.page,
            sizePerPage: eQueryParams.sizePerPage,
            viewName: formattedViewName,
            viewId: formattedViewId,
            searchCriteria: eQueryParams.searchCriteria
        });

        window.history.replaceState(null, null, qParams);
        /**if onPillChnage filtion passed as prop execute it by passing selected pill and index */
        onPillChange && onPillChange(selectedPill, eventKey);
    }

    const handleSelectChanges = (name, value) => {
        this.setState({ [name]: value });
    }

    const getGridConfig = () => {
        const { expandRow, simpleGrid, compactView, paginationPosition } = props;
        /**
         * Expand options
         * Note : Spread all the expand options only if the expandRow function is available otherwise skip those props
         */
        const expandColumnVisible = expandRow ? true : false;
        const expandOptions = expandRow ?
            {
                expandableRow: isExpandableRow,
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
                sizePerPageList: [{
                    text: '10', value: 10
                }, {
                    text: '50', value: 50
                }, {
                    text: '100', value: 100
                }, {
                    text: '200', value: 200
                }],
                showTotal: true,
                paginationPosition: paginationPosition || "bottom",
                paginationSize: compactView ? 1 : 5,
                paginationShowsTotal: compactView ? null : renderShowsTotal,
                noDataText: 'There is no data to display',
                paginationPosition: "bottom",
                onSortChange: onSortChange,
                onPageChange: onPageChange,
                expandBy: "column", // Currently, available value is row and column, default is row
                expandRowBgColor: "rgb(232, 232, 229)"
            };

        const remote = simpleGrid ? false : true;
        const pagination = simpleGrid ? false : true;
        const data = simpleGrid ? props.data : docs;
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
    const renderGrid = () => {
        const { expandOptions, options, remote, pagination, data } = getGridConfig();
        const { selectRow, handleCellEdit, headerClass, compactView, bodyContainerClass } = props;
        let stickyColPosition = 0;

        return (
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
                        const isNested = (column.dataField || "").indexOf(".") >= 0;
                        // Enable sticky column in the grid
                        let columnWidth = column.width ? String(column.width) : "200px";

                        const stickyColCSS = {
                            position: "sticky",
                            zIndex: 1,
                            background: "#b3e5fc",
                            left: stickyColPosition,
                            borderRight: "0.5px solid #c6d9f1"
                        }
                        stickyColPosition = (stickyColPosition + parseInt(columnWidth));
                        // End                        
                        const formatter = isNested
                            ? function (cell, row) {
                                const value = get(row, column.dataField);
                                if (column.formatter) {
                                    return column.formatter(value, row);
                                }
                                return value;
                            }
                            : column.formatter;
                        return (
                            <TableHeaderColumn
                                isKey={idx == 0 ? true : false}
                                dataField={column.dataField}
                                width={column.width ? String(column.width) : "200px"}
                                dataSort={column.sort === false ? false : true}
                                dataFormat={formatter}
                                hidden={column.hidden === true ? true : false}
                                tdStyle={column.style && column.style.enableSticky == true ? { ...stickyColCSS } : column.style}
                                thStyle={column.style && column.style.enableSticky == true ? { ...stickyColCSS } : column.style}
                                key={idx}
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
        )
    }

    /**
 * Render quick filters if there are anything configured
 */
    const renderQuickFilters = (columns) => {
        return (
            <QuickSearch columns={columns} />
        )
    }

    /**
     * Render main function
     */
    return (
        <ErrorWrapper error={error || loadError} errorTop={true}>
            <LoadingWrapper loading={loading}>
                {columns.length > 0 &&
                    <>
                        <Toolbar
                            {...props}
                            columns={columns}
                            pillOptions={pillOptions}
                            hideSearchModals={hideSearchModals}
                            functions={{
                                onClickRefresh: onClickRefresh,
                                showAdvanceSearch: () => setShowAdvanceSearchModal(true),
                                showEasySearch: () => setShowEasySearchModal(true),
                                clearAdvanceSearch: clearAdvanceSearch,
                                loadData: loadWithAdvanceSearch,
                                handlePillChanges: handlePillChanges
                            }} />
                        <br />
                        {renderGrid()}
                        {showAdvanceSearchModal && <AdvanceSearch
                            //ref="advanceSearch"
                            searchCriterias={filters}
                            columns={columns}
                            loadData={loadWithAdvanceSearch}
                            modelName={modelName}
                            gridId={gridId}
                            hideAdvanceSearchModal={() => setShowAdvanceSearchModal(false)}
                        />}
                        {showEasySearchModal && <EasySearchModal
                            searchCriterias={filters}
                            columns={columns}
                            loadData={loadWithAdvanceSearch}
                            modelName={modelName}
                            gridId={gridId}
                            hideModal={() => setShowEasySearchModal(false)}
                        />}
                    </>
                }
            </LoadingWrapper>
        </ErrorWrapper>
    );
}

export default forwardRef(ByjusGrid);
