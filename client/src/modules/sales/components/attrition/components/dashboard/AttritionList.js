import React, { useState } from 'react';
import moment from 'moment';
import { cloneDeep, remove } from 'lodash';
import { Alert } from "reactstrap";

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';

const AttritionList = () => {
    let searchFormRef = "";
    const baseUrl = `/usermanagement/attrition/listAttrition`;
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().format('YYYY-MM-DD');
    const [selectedRows, setSelectedRows] = useState([]);
    const [fromDate, setFromDate] = useState(currentDate);
    const [toDate, setToDate] = useState(currentDate);
    const [error, setErrorMessage] = useState(null);
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?fromDate=${fromDate}&toDate=${toDate}`);

    const getColumns = () => {
        const columns = [{
            dataField: 'exitInitiationDate',
            text: 'Exit Initiation Date',
            formatter: (cell) => {
                return cell && moment(cell).format("YYYY-MM-DD HH:mm:ss");
            }
        }, {
            dataField: "email",
            text: "Employee Email",
            width: '250px',
            quickFilter: true
        }, {
            dataField: "tnlId",
            text: "Employee Tnl Id",
            quickFilter: true
        }, {
            dataField: "requestType",
            text: "Request Type",
            width: '250px'
        }, {
            dataField: "employeeExitReason",
            text: "Exit Reason(Employee)",
            width: '255px',
            quickFilter: true
        }, {
            dataField: 'managementExitReason',
            text: 'Exit Reason(Manager/HR)',
            width: '260px',
            quickFilter: true
        }, {
            dataField: 'lastWorkingDate',
            text: 'Approved LWD',
            quickFilter: true,
            formatter: (cell) => {
                return cell && moment(cell).format("YYYY-MM-DD HH:mm:ss");
            }
        }, {
            dataField: 'createdAt',
            text: 'Created At',
            formatter: (cell) => {
                return cell && moment(cell).format("YYYY-MM-DD HH:mm:ss");
            }
        }, {
            dataField: 'updatedAt',
            text: 'Updated At',
            formatter: (cell) => {
                return cell && moment(cell).format("YYYY-MM-DD HH:mm:ss");
            }
        }];

        return columns;
    }

    const getPills = () => {
        return [{
            title: 'All',
            contextCriterias: [{
                selectedColumn: 'requestType',
                selectedOperator: 'not_in',
                selectedValue: []
            }]
        }, {
            title: 'Voluntary',
            contextCriterias: [{
                selectedColumn: 'requestType',
                selectedOperator: 'in',
                selectedValue: ['Voluntary']
            }]
        }, {
            title: 'Involuntary',
            contextCriterias: [{
                selectedColumn: 'requestType',
                selectedOperator: 'in',
                selectedValue: ['InVoluntary']
            }]
        }];
    }

    const onClickSearch = () => {
        setGridDataUrl(`${baseUrl}/?fromDate=${fromDate}&toDate=${toDate}`);
    }

    const onChangeDate = (value, name) => {
        if (name === "fromDate") {
            setFromDate(value);
        }
        else if (name === "toDate") {
            setToDate(value);
        }
    }

    const getSearchFields = () => {
        return [{
            type: 'date',
            name: 'fromDate',
            value: fromDate,
            onChange: onChangeDate
        }, {
            type: 'date',
            name: 'toDate',
            value: toDate,
            onChange: onChangeDate
        }, {
            type: 'button',
            text: 'Search',
            onClick: onClickSearch
        }];
    }

    const columns = getColumns();
    const pills = getPills();
    const fields = getSearchFields();

    return (
        <Box>
            <BoxBody>
                <FormBuilder
                    ref={element => (searchFormRef = element)}
                    fields={fields}
                    initialValues={{
                        fromDate,
                        toDate
                    }}
                    cols={4}
                />

                <ByjusGrid
                    ref={element => setByjusGridRef(element)}
                    columns={columns}
                    pillOptions={{
                        pills,
                        defaultPill: 1
                    }}
                    modelName="AttritionDetail"
                    gridTitle="AttritionDetail"
                    gridDataUrl={gridDataUrl}
                    sort={{ email: 1 }}
                    error={error}
                />
            </BoxBody>
        </Box>
    );
}

export default AttritionList;