import React, { useState, useEffect } from 'react';
import lodash from 'lodash';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

import PillBuilder from './PillBuilderV2';
import QuickSearchBox from './QuickSearchBox';

const ToolbarV2 = (props) => {
    const { pillOptions, addOnQfColumns, functions = {}, gridTitle, modelName, gridId, columns, dbName, hideSearchModals } = props;
    const { toolbarItems, simpleGrid, quickFilter = false, compactView } = props;
    const [columnField, setColumnField] = useState(null);
    const [searchText, setSearchText] = useState(null);
    const [colOptions, setColOptions] = useState([]);
    const [selectedPill, setSelectedPill] = useState(props.selectedPill || props.defaultPill);
    const [tbDropdownOpen, setTbDropdownOpen] = useState(false);
    const pills = lodash.get(pillOptions, 'pills', []);

    useEffect(() => {
        let qfColumns = lodash.filter(columns, { 'quickFilter': true });
        qfColumns = !lodash.isEmpty(addOnQfColumns) ? lodash.concat(qfColumns, addOnQfColumns) : qfColumns;
        /**Removing empty values */
        lodash.remove(qfColumns, col => lodash.isEmpty(col));
        const colOptions = qfColumns.map((column) => {
            return {
                label: column.text,
                value: column.dataField
            }
        }) || [];
        setColOptions(colOptions);

        /**
         * set the first quickfilter option to default and reset searchText if the 
         * currently selected option does not exits in the new quickfilter options.
         * */
        if (!colOptions.some(({ value }) => value === columnField)) {
            const defaultValue = colOptions[0] && colOptions[0].value;
            setColumnField(defaultValue);
            setSearchText(null);
        }
    }, [columns, pillOptions])

    const toggleTbDropdown = () => {
        setTbDropdownOpen(!tbDropdownOpen);
    }

    const applyQuickFilter = (columnField, searchText) => {
        const { functions = {} } = props;
        const conditionType = "$and";
        const searchValues = searchText ? searchText.split(",") : [];
        let searchBuilder = [];

        if (searchValues.length > 0) {
            searchBuilder = [{
                selectedColumn: columnField,
                selectedOperator: searchValues.length == 1 ? "equal" : "in",
                selectedValue: searchValues
            }];
            functions.loadData({ conditionType, searchBuilder });
        }
        else {
            functions.clearAdvanceSearch();
        }
    }

    /**
    * Render Pills
    * The default pill filter should be applied during first load
    */
    const renderPills = () => {
        const { pills, defaultPill, type } = pillOptions || {};
        const pillCount = pills ? pills.length : 0;
        /**If selectedPill from state is within the pillCount then use selectedPill else use defaultPill */
        const pillToSelect = (selectedPill <= pillCount) ? selectedPill : (defaultPill || 1);
        const finalPills = pillCount > 0 ? pills : [{ title: 'All' }];

        return (
            <PillBuilder
                pills={finalPills}
                gridTitle={gridTitle}
                modelName={modelName}
                gridId={gridId}
                dbName={dbName}
                onSelect={functions.handlePillChanges}
                defaultPill={pillToSelect}
                type={type}
            />
        );
    }

    return (
        <div className="grid-toolbar clearfix mb-1">
            {pills.length > 0 && renderPills()}
            <div className="d-inline-block float-right">
                {
                    (colOptions.length > 0 && !compactView)
                    && <QuickSearchBox
                        style={{ width: '300px', display: 'inline-block' }}
                        colOptions={colOptions}
                        onSearch={applyQuickFilter}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        columnField={columnField}
                        setColumnField={setColumnField}
                    />
                }
                {!simpleGrid && (
                    <>
                        {toolbarItems && <div className="d-inline-block ml-5">{toolbarItems}</div>}
                        <Dropdown isOpen={tbDropdownOpen} toggle={toggleTbDropdown} className="d-inline-block ml-2">
                            <DropdownToggle caret size="sm">
                                <i className="fa fa-bars" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={functions.onClickRefresh}>
                                    <i className="fa fa-refresh" /> Refresh
                                </DropdownItem>
                                {hideSearchModals !== true && <DropdownItem onClick={functions.showAdvanceSearch}>
                                    <i className="fa fa-search-plus" /> Advance Search
                                </DropdownItem>}
                                {/* <DropdownItem onClick={functions.showEasySearch}>
                                    <i className="fa fa-search-plus" /> Easy Search
                                </DropdownItem> */}
                                {hideSearchModals !== true && <DropdownItem onClick={functions.clearAdvanceSearch}>
                                    <i className="fa fa-close" /> Clear Search
                                </DropdownItem>}
                                {quickFilter && <DropdownItem onClick={functions.onClickQuickSearch}>
                                    <i className="fa fa-search" /> Quick Search
                                </DropdownItem>}
                            </DropdownMenu>
                        </Dropdown>
                    </>
                )}
            </div>
            {
                (colOptions.length > 0 && compactView)
                && <div className="mt-1">
                    <QuickSearchBox
                        colOptions={colOptions}
                        onSearch={applyQuickFilter}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        columnField={columnField}
                        setColumnField={setColumnField}
                    />
                </div>
            }
        </div>
    );
}

export default ToolbarV2;
