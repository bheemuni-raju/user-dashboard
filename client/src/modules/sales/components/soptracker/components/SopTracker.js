import React, { useState } from 'react';
import moment from 'moment';
import { cloneDeep, remove } from 'lodash';
import { Button, Row, Col, Alert } from "reactstrap";

import { BoxBody, Box } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

const SopTracker = (props) => {
    let serachFormRef = "";
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().format('YYYY-MM-DD');
    const baseUrl = `/usermanagement/managesop/list`;
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [selectedReportingManager, setSelectedReportingManager] = useState("");
    const [showActionModal, setShowActionModal] = useState(false);
    const [showWorkflowHistory, setShowWorkFlowHistoryModal] = useState(false);
    const [rowData, setRowData] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [error, setErrorMessage] = useState(null);
    const [showMeetingAttendanceModal, setShowMeetingAttendanceUpdateModal] = useState(false);
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?date=${selectedDate}`);

    const showModal = (rowData) => {
        setShowActionModal(true);
        setRowData(rowData);
    }

    const showWorkFlowHistoryModal = (value, rowData) => {
        setShowWorkFlowHistoryModal(value);
        setRowData(rowData);
    }

    const closeModal = () => {
        setShowActionModal(false);
        setRowData({});
    };

    const handleFromSubmit = (formData) => {
        formData._id = rowData._id;
        callApi(`/usermanagement/wfhattendance/updateAttendance`, 'PUT', formData, null, null, true)
            .then((response) => {
                closeModal();
                setErrorMessage(null);
                byjusGridRef && byjusGridRef.onClickRefresh();
            })
            .catch(error => {
                setErrorMessage(error.error);
            })
    }

    const getColumns = () => {
        const columns = [{
            dataField: 'date',
            text: 'SOP Date'
        }, {
            dataField: 'reportingManagerEmailId',
            text: 'TM Email',
            quickFilter: true
        }, {
            dataField: "emailId",
            text: "Employee Email",
            width: '250px',
            quickFilter: true
        }, {
            dataField: "performanceRating",
            text: "Performance Rating",
            quickFilter: true
        },{
            dataField: "cohortId",
            text: "Cohort",
            width: '250px',
            quickFilter: true
        },{
            dataField: "vertical",
            text: "Vertical",
            width: '250px',
            quickFilter: true
        },{
            dataField: "doj",
            text: "DOJ",
            width: '250px',
            quickFilter: true,
            formatter: (cell) => {
                return cell ? moment(cell).format('LLL') : "";
            } 
        }, {
            dataField: "performanceRevenue",
            text: "Performane Revenue",
            quickFilter: true
        }, {
            dataField: "minTargetRevenue",
            text: "Minimum Target Revenue",
            quickFilter: true
        }, {
            dataField: "minTargetRevenueAchieved",
            text: "Minimum Target Revenue Achieved",
            quickFilter: true
        }, {
            dataField: "expectedTargetRevenue",
            text: "Expected Target Revenue",
            quickFilter: true
        }, {
            dataField: "expectedTargetRevenueAchieved",
            text: "Expected Target Revenue Ahieved",
            quickFilter: true
        }];

        return columns;
    }

    const getPills = () => {
        return [{
            title: 'All',
            contextCriterias: []
        }, {
            title: 'Reporting Manager Missing',
            contextCriterias: [{
                selectedColumn: "reportingManagerEmailId",
                selectedOperator: "in",
                selectedValue: ["", null]
            }]
        }, {
            title: 'Vertical Missing',
            contextCriterias: [{
                selectedColumn: "vertical",
                selectedOperator: "in",
                selectedValue: ["", null]
            }]
        }, {
            title: 'DOJ Missing',
            contextCriterias: [{
                selectedColumn: "doj",
                selectedOperator: "in",
                selectedValue: ["", null]
            }]
        }, {
            title: 'Performance Rating Missing',
            contextCriterias: [{
                selectedColumn: "performanceRating",
                selectedOperator: "in",
                selectedValue: ["", null]
            }]
        }, {
            title: 'Performance Rating - QRA Risk',
            contextCriterias: [{
                selectedColumn: "performanceRating",
                selectedOperator: "in",
                selectedValue: ["qra_risk"]
            }]
        }, {
            title: 'Performance Rating - Good',
            contextCriterias: [{
                selectedColumn: "performanceRating",
                selectedOperator: "in",
                selectedValue: ["good"]
            }]
        }, {
            title: 'Performance Rating - Average',
            contextCriterias: [{
                selectedColumn: "performanceRating",
                selectedOperator: "in",
                selectedValue: ["average"]
            }]
        }];
    }

    const onClickSearch = () => {
        setGridDataUrl(`${baseUrl}/?date=${selectedDate}&reportingManagerEmailId=${selectedReportingManager}`);
    }

    const onChangeDate = (value, name) => {
        setSelectedDate(value);
    }

    const onChangeManager = (value, name) => {
        setSelectedReportingManager(value || "");
    }

    const getSearchFields = () => {
        return [{
            type: 'date',
            name: 'selectedDate',
            value: selectedDate,
            onChange: onChangeDate
        }, {
            type: "select",
            name: "email",
            model: "Employee",
            filter: { subDepartment: "sales", role: "team_manager" },
            placeholder: 'Enter Email',
            onChange: onChangeManager,
            displayKey: "email",
            valueKey: "email"
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
                    ref={element => (serachFormRef = element)}
                    fields={fields}
                    initialValues={{
                        selectedDate
                    }}
                    cols={4}
                />

                <ByjusGrid
                    ref={element => setByjusGridRef(element)}
                    gridDataUrl={gridDataUrl}
                    columns={columns}
                    pillOptions={{
                        pills,
                        defaultPill: 2
                    }}
                    sort={{ emailId: 1 }}
                    error={error}
                />
            </BoxBody>
        </Box>
    );
}

export default SopTracker;
