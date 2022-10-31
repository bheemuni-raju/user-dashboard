import React, { useState } from 'react';
import moment from 'moment';
import { cloneDeep, remove } from 'lodash';
import { Alert } from "reactstrap";

import { BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';

const SapAttendanceList = () => {
    let searchFormRef = "";
    const baseUrl = `/usermanagement/attendance/listAttendance`;
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().format('YYYY-MM-DD');
    const [selectedRows, setSelectedRows] = useState([]);
    const [fromDate, setFromDate] = useState(currentDate);
    const [toDate, setToDate] = useState(currentDate);
    const [error, setErrorMessage] = useState(null);
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?fromDate=${fromDate}&toDate=${toDate}`);

    const getColumns = () => {
        const columns = [{
            dataField: 'date',
            text: 'Attendance Date'
        }, {
            dataField: "email",
            text: "Employee Email",
            width: '250px',
            quickFilter: true
        }, {
            dataField: "sapId",
            text: "Employee SAP Id",
            quickFilter: true
        }, {
            dataField: "tnlId",
            text: "Employee Tnl Id",
            quickFilter: true
        }, {
            dataField: "dailyWorkScheduleStatus",
            text: "Daily Work Schedule Status",
            quickFilter: true
        }, {
            dataField: 'punchInTime',
            text: 'Punch In Time',
            quickFilter: true
        }, {
            dataField: 'punchOutTime',
            text: 'Punch Out Time',
            quickFilter: true
        }, {
            dataField: 'totalHours',
            text: 'Total Hours',
            quickFilter: true
        }, {
            dataField: 'attendanceStatus',
            text: 'Attendance Status',
            quickFilter: true
        }, {
            dataField: 'achieveStatus',
            text: 'Achieve Status',
            quickFilter: true
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
                selectedColumn: 'attendanceStatus',
                selectedOperator: 'not_in',
                selectedValue: []
            }]
        }, {
            title: 'Present',
            contextCriterias: [{
                selectedColumn: 'attendanceStatus',
                selectedOperator: 'in',
                selectedValue: ['P']
            }]
        }, {
            title: 'On Duty',
            contextCriterias: [{
                selectedColumn: 'attendanceStatus',
                selectedOperator: 'in',
                selectedValue: ['OD']
            }]
        }, {
            title: 'Other',
            contextCriterias: [
                {
                    selectedColumn: 'attendanceStatus',
                    selectedOperator: 'not_in',
                    selectedValue: ['P', 'OD']
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
        <BoxBody>
            <Alert color="info">
                [P - Present]
                [OD - On Duty]
                [Other - Other than Present or On Duty]
            </Alert>
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
                modelName="SAPAttendance"
                gridTitle="SAP Attendance"
                gridDataUrl={gridDataUrl}
                sort={{ email: 1 }}
                error={error}
            />
        </BoxBody>
    );
}

export default SapAttendanceList;