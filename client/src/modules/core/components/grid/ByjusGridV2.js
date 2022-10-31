import React, { useEffect, Fragment, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { get, isEmpty, remove, isEqual, snakeCase, concat, sortBy, find } from "lodash";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

import ErrorWrapper from 'components/error/ErrorWrapper';
import LoadingWrapper from "components/LoadingWrapper";
import { callApi } from "store/middleware/api";
import AdvanceSearch from "modules/core/components/advancesearch/AdvanceSearch";
import Toolbar from './ToolbarV2';

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

const existingQueryParams = () => {
    const qParams = new URLSearchParams(window.location.search);
    const qPage = qParams.get('page');
    const qViewName = qParams.get('viewName');
    const qSizePerPage = qParams.get('sizePerPage');
    const qViewId = qParams.get('viewId');

    return {
        qPage: qPage ? Number(qPage) : 1,
        qSizePerPage: qSizePerPage ? Number(qSizePerPage) : 10,
        qViewName: qViewName || 'all',
        qViewId: qViewId
    };
}

const ByjusGrid = (props, ref) => {
    let _isMounted = false;
    const { modelName, gridId, error, filters } = props;
    const urlSuffix = modelName.toLowerCase();
    //const history = useHistory();
    const { qPage, qViewName, qViewId, qSizePerPage } = existingQueryParams();
    let gridCriterias = get(props, 'contextCriterias', []).filter((ele => !isEmpty(ele)));
    const [columns, setColumns] = useState(props.columns || []);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [sort, setSort] = useState(props.sort || {});
    const [contextCriterias, setContextCriterias] = useState(gridCriterias);
    const [searchCriterias, setSearchCriterias] = useState(props.searchCriterias || []);
    const [gridDataUrl, setGridDataUrl] = useState(props.gridDataUrl || `/${urlSuffix}/list`);
    const [docs, setDocs] = useState([]);
    const [page, setPage] = useState(qPage || 1);
    const [sizePerPage, setSizePerPage] = useState(qSizePerPage || props.sizePerPage || 10);
    const [pillOptions, setPillOptions] = useState({});
    const [viewName, setViewName] = useState(qViewName);
    const [totalSize, setTotalSize] = useState(0);
    //const [options, setOptions] = useState({});
    //const [noDefaultLoad, setNoDefaultLoad] = useState(props.noDefaultLoad || false);
    const [showAdvanceSearchModal, setShowAdvanceSearchModal] = useState(false);
    const prevState = usePrevious({ columns, page, sort, gridDataUrl, sizePerPage, docs, searchCriterias, contextCriterias }) || {};

    useEffect(() => {
        //If it is not simpleGrid OR defaultLoad is false OR if pills exists as well don't load the data
        //if (!simpleGrid && !noDefaultLoad && size(pillOptions.pills) === 0) {
        //    loadData();
        //}
        //_isMounted = true;
        //return () => { _isMounted = false; };
    }, [])

    /*history.push({
        //pathname: '/client',
        search: "?" + new URLSearchParams({ page, sizePerPage }).toString()
    });*/

    useEffect(() => {
        if (!isEmpty(prevState) && !isEqual(columns, prevState.columns)) {
            setColumns(columns);
        }

        if (!isEmpty(prevState) && gridDataUrl != prevState.gridDataUrl) {
            setGridDataUrl(gridDataUrl);
        }

        if (!isEmpty(prevState) && !isEqual(searchCriterias, prevState.searchCriterias)) {
            setSearchCriterias(searchCriterias);
        }

        if (!isEmpty(prevState) && !isEqual(contextCriterias, prevState.contextCriterias)) {
            setContextCriterias(contextCriterias);
        }

        if (
            prevState && (
                page != prevState.page ||
                sizePerPage != prevState.sizePerPage ||
                (sort && !isEqual(sort, prevState.sort)) ||
                (searchCriterias && !isEqual(searchCriterias, prevState.searchCriterias)) ||
                (contextCriterias && !isEqual(contextCriterias, prevState.contextCriterias))
            )
        ) {
            loadData();
        }
    }, [columns, gridDataUrl, searchCriterias, contextCriterias, page, sort, sizePerPage])

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
        const { qViewName, qViewId } = existingQueryParams();

        const qParams = "?" + new URLSearchParams({
            page: page || 1,
            sizePerPage: sizePerPage || 10,
            viewName: qViewName,
            viewId: qViewId
        }).toString();

        window.history.replaceState(null, null, qParams);
        setPage(page);
        setSizePerPage(sizePerPage);
    }

    const loadData = async (options) => {
        const qParams = existingQueryParams();
        const { modelName, gridId, dbName, populate, select, onLoadDataCompletion } = props;

        remove(contextCriterias, n => isEmpty(n));
        let bodyPayload = {
            gridId: gridId,
            viewName: qParams.qViewName,
            viewId: qParams.qViewId,
            model: modelName,
            db: dbName,
            populate: populate,
            page: page || 1,
            limit: sizePerPage || 10,
            contextCriterias,
            searchCriterias,
            sort: sort || {},
            select: select
        };

        try {
            setLoading(true);
            const apiResponse = await callApi(gridDataUrl, "POST", bodyPayload, null, null, true);
            setLoading(false);
            const { gridConfig } = apiResponse;
            const viewDetails = find(gridConfig, { 'viewFormattedName': qParams.qViewName || 'all' });
            const remoteColumns = viewDetails && get(viewDetails, 'columns', '') || get(gridConfig, '0.columns');

            if (!props.columns && remoteColumns) {
                const finalViews = gridConfig && gridConfig.map(gridView => {
                    return {
                        ...gridView,
                        title: gridView.viewName,
                    };
                });
                const finalPills = finalViews ? finalViews : get(this.props, 'pillOptions.pills', []);
                const finalColumns = computeFinalColumns(remoteColumns);
                setColumns(finalColumns);
                setPillOptions({
                    ...pillOptions,
                    pills: finalPills
                })
            }

            setDocs(apiResponse.docs);
            setTotalSize(apiResponse.total);
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
        const { qPage, qSizePerPage } = existingQueryParams();

        if (selectedPill) {
            let { contextCriterias } = selectedPill;
            /**If the pill context criteria is empty, pass the default criteria [{}] so that the grid will load initially */
            if (isEmpty(contextCriterias)) contextCriterias = [];
            /**Store selectedPill and contextCiteria in state */
            setViewName(formattedViewName);
            setContextCriterias([...contextCriterias, ...commonContextCriteria]);
        }

        const qParams = "?" + new URLSearchParams({
            page: qPage,
            sizePerPage: qSizePerPage,
            viewName: formattedViewName,
            viewId: formattedViewId
        }).toString();

        window.history.replaceState(null, null, qParams);
        /**if onPillChnage filtion passed as prop execute it by passing selected pill and index */
        onPillChange && onPillChange(selectedPill, eventKey);
    }

    const getGridConfig = () => {
        const { expandRow, simpleGrid, compactView } = props;
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
                paginationSize: compactView ? 1 : 5,
                page,
                sizePerPage,
                showTotal: true,
                noDataText: 'There is no data to display',
                paginationPosition: "bottom",
                paginationShowsTotal: compactView ? null : renderShowsTotal,
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
        const { selectRow } = props;

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
            >
                {columns &&
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
                            >
                                {column.text}
                            </TableHeaderColumn>
                        );
                    })}
            </BootstrapTable>
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
                            pillOptions={pillOptions}
                            functions={{
                                onClickRefresh: onClickRefresh,
                                showAdvanceSearch: () => setShowAdvanceSearchModal(true),
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
                    </>
                }
            </LoadingWrapper>
        </ErrorWrapper>
    );
}

export default forwardRef(ByjusGrid);
