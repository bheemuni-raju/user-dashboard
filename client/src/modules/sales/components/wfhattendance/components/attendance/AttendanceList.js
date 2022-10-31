import React, { Component, useState, useEffect } from 'react';
import moment from 'moment';
import { find, get, cloneDeep, remove } from 'lodash';
import { Button, Row, Col, Alert } from "reactstrap";

import { BoxBody, Box, BoxHeader } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

import AttendanceEditModal from './AttendanceEditModal';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import MeetingAttendanceUpdateModal from './MeetingAttendanceUpdateModal';

const AttendanceList = (props) => {
    let serachFormRef = "";
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().format('YYYY-MM-DD');
    const baseUrl = `/usermanagement/wfhattendance/list`;
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
            dataField: 'emailId',
            text: 'Action',
            width: '120px',
            formatter: (cell, row) => {
                return (
                    <div>
                        <Row>
                            <Col className="col-5">
                                <Button type="primary" size="small" className="mr-1" onClick={() => showModal(row)}>
                                    <i className="fa fa-pencil" />
                                </Button>
                            </Col>
                            <Col className="col-5">
                                <Button type="primary" size="small" className="mr-1" onClick={() => showWorkFlowHistoryModal(true, row)}>
                                    <i className="fa fa-eye" />
                                </Button>
                            </Col>
                        </Row>
                    </div>
                );
            }
        }, {
            dataField: 'date',
            text: 'Attendance Date'
        }, {
            dataField: "emailId",
            text: "Employee Email",
            width: '250px',
            quickFilter: true
        }, {
            dataField: "tnlId",
            text: "Employee Tnl",
            quickFilter: true
        }, {
            dataField: 'reportingManagerEmailId',
            text: 'TM Email',
            quickFilter: true
        }, {
            dataField: 'meetingAttendanceStatus',
            text: 'Meeting Attendance Status',
            quickFilter: true
        }, {
            dataField: 'meetingAttendanceUpdatedBy',
            text: 'Meeting Attendance Updated By',
            quickFilter: true
        }, {
            dataField: 'talktime',
            text: 'Talktime'
        }, {
            dataField: 'demoSessions',
            text: 'Demo Sessions'
        }, {
            dataField: 'connectedCalls',
            text: 'Connected Calls'
        }, {
            dataField: 'workflowStatus',
            text: 'WorkFlow Status',
            quickFilter: true
        }, {
            dataField: 'reportingManagerRequest.workflowStatus',
            text: 'TM WorkFlow Status',
            quickFilter: true
        }, {
            dataField: 'reportingManagerRequest.reason',
            text: 'TM Request Reason',
            quickFilter: true
        }, {
            dataField: 'reportingManagerRequest.reason',
            text: 'Manager Request Reason'
        }, {
            dataField: 'salesPersonRequest.workflowStatus',
            text: 'SP WorkFlow Status',
            quickFilter: true
        }, {
            dataField: 'salesPersonRequest.reason',
            text: 'SP Request Reason',
            quickFilter: true
        }, {
            dataField: 'systemAttendance',
            text: 'System Attendance',
            quickFilter: true
        }, {
            dataField: 'finalAttendance',
            text: 'Final Attendance',
            quickFilter: true
        }];

        return columns;
    }

    const getPills = () => {
        return [{
            title: 'All',
            contextCriterias: []
        }, {
            title: 'MYTBM',
            contextCriterias: [{
                selectedColumn: 'meetingAttendanceStatus',
                selectedOperator: 'in',
                selectedValue: ['', null, 'meeting_attendance_marking_open']
            }]
        }, {
            title: 'MA',
            contextCriterias: [{
                selectedColumn: 'meetingAttendanceStatus',
                selectedOperator: 'in',
                selectedValue: ['attended']
            }]
        }, {
            title: 'MNA',
            contextCriterias: [
                {
                    selectedColumn: 'meetingAttendanceStatus',
                    selectedOperator: 'in',
                    selectedValue: ['not_attended']
                }]
        }, {
            title: 'MNM',
            contextCriterias: [{
                selectedColumn: 'meetingAttendanceStatus',
                selectedOperator: 'in',
                selectedValue: ['not_marked']
            }]
        }, {
            title: 'TMOFD',
            contextCriterias: [{
                selectedColumn: 'reportingManagerRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['manager_dispute_open']
            }]
        }, {
            title: 'TMRR',
            contextCriterias: [{
                selectedColumn: 'reportingManagerRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['request_raised']
            }]
        }, {
            title: 'TMRA',
            contextCriterias: [{
                selectedColumn: 'reportingManagerRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['approved']
            }]
        }, {
            title: 'TMRRJ',
            contextCriterias: [{
                selectedColumn: 'reportingManagerRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['rejected']
            }]
        }, {
            title: 'SPOFD',
            contextCriterias: [{
                selectedColumn: 'salesPersonRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['bda_dispute_open']
            }]
        }, {
            title: 'SPRR',
            contextCriterias: [{
                selectedColumn: 'salesPersonRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['request_raised']
            }]
        }, {
            title: 'SPRA',
            contextCriterias: [{
                selectedColumn: 'salesPersonRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['approved']
            }]
        }, {
            title: 'SPRRJ',
            contextCriterias: [{
                selectedColumn: 'salesPersonRequest.workflowStatus',
                selectedOperator: 'in',
                selectedValue: ['rejected']
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

    const showMeetingStatusUpdateModal = (show) => {
        setShowMeetingAttendanceUpdateModal(show);
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
            filter: { subDepartment: "sales", role: { $in: ["team_manager", "bdtm"] } },
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

    const handleOnSelect = (selectedRow, isSelected) => {
        if (isSelected) {
            const rows = cloneDeep(selectedRows);
            rows.push(selectedRow);

            setSelectedRows(rows);
        } else {
            const rows = cloneDeep(selectedRows);
            remove(rows, eachRow => {
                return selectedRow.emailId === eachRow.emailId;
            });

            setSelectedRows(rows);
        }
    };

    const handleOnSelectAll = (isSelectedAll, selectedItems) => {
        if (isSelectedAll) {
            setSelectedRows(selectedItems);
        } else {
            setSelectedRows([]);
        }
    };

    const handleUpdateAttendanceStatusFromSubmit = (formData) => {
        let dates = selectedRows.map(row => {
            return row.date;
        });
        let emailIds = selectedRows.map(row => {
            return row.emailId;
        });

        formData.emailIds = emailIds;
        formData.dates = dates;

        callApi(`/usermanagement/wfhattendance/updateMeetingAttendanceStatus`, 'PUT', formData, null, null, true)
            .then((response) => {
                showMeetingStatusUpdateModal(false);
                setErrorMessage(null)
                byjusGridRef && byjusGridRef.onClickRefresh();
            })
            .catch(error => {
                setErrorMessage(error.error)
            })
    }

    const buildToolBarButtons = () => {
        return <Button onClick={showMeetingStatusUpdateModal} name="meetingAttendanceStatusButton">
            Update Meeting Attendance
               </Button>
    }

    const columns = getColumns();
    const pills = getPills();
    const fields = getSearchFields();

    const selectRowProp = {
        mode: 'checkbox',
        bgColor: 'lightblue',
        onSelect: handleOnSelect,
        onSelectAll: handleOnSelectAll,
        clickToSelect: false
    };

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
                    selectRow={selectRowProp}
                    toolbarItems={selectedRows.length ? buildToolBarButtons() : ""}
                    error={error}
                />

                {showActionModal && (
                    <AttendanceEditModal
                        onSave={handleFromSubmit}
                        onClose={closeModal}
                        rowData={rowData}
                        error={error}
                    />
                )}

                {showMeetingAttendanceModal && (
                    <MeetingAttendanceUpdateModal
                        onSave={handleUpdateAttendanceStatusFromSubmit}
                        onClose={showMeetingStatusUpdateModal}
                        selectedRows={selectedRows}
                    />
                )}

                {showWorkflowHistory && (
                    <AttendanceHistoryModal
                        onClose={showWorkFlowHistoryModal}
                        rowData={rowData}
                    />
                )}
            </BoxBody>
        </Box>
    );
}

export default AttendanceList;
