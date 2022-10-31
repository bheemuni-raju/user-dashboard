import React, { Component, useState } from 'react';
import moment from 'moment';
import { get, concat } from 'lodash';
import { Button } from 'reactstrap';

import { BoxBody, Box } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

import WorkflowConfigModal from './WorkflowConfigModal';
import WorkflowMoveStageModal from './WorkflowMoveStageModal';

const timestampsKeyMap = {
    "seedingStatus": "seedingAt",
    "meetingAttendanceStatus": { start: "meetingAttendanceStartingAt", end: "meetingAttendanceLockingAt" },
    "uploadTalktimeStatus": { start: "uploadTalktimeStartingAt", end: "uploadTalktimeLockingAt" },
    "managerDisputeStatus": { start: "managerDisputeStartingAt", end: "managerDisputeLockingAt" },
    "agentDisputeStatus": { start: "agentDisputeStartingAt", end: "agentDisputeLockingAt" },
    "finalStatus": "finalAttendanceLockingAt"
}

const checkFormatter = (cell, row, key) => {
    if (!cell) return "";
    let timestampKey = "";
    let formattedDateStartTime = "";
    let formattedDateEndTime = "";
    if (key) {
        timestampKey = timestampsKeyMap[key];
        if (typeof timestampKey === "object") {
            formattedDateStartTime = row[timestampKey.start] ? moment(row[timestampKey.start]).format('MMMM DD, YYYY h:mm A') : "";
            formattedDateEndTime = row[timestampKey.end] ? moment(row[timestampKey.end]).format('MMMM DD, YYYY h:mm A') : "";
        } else {
            formattedDateStartTime = row[timestampKey] ? moment(row[timestampKey]).format('MMMM DD, YYYY h:mm A') : "";
        }
    }
    if (cell === "closed" || cell.includes("completed")) {
        return (
            <div>
                <i className="fa fa-check" style={{ color: "green" }}></i>
                <br /> {"Start: " + formattedDateStartTime}
                {formattedDateEndTime && (
                    <>
                        <br /> {"End: " + formattedDateEndTime}
                    </>
                )}
            </div>
        )
    }
    return (
        <div>
            <i className="fa fa-ban" style={{ color: "red" }}></i>
            <div
                className="badge badge-warning"
                style={{ fontSize: "0.8125rem" }}
            >
                {cell}
            </div><br />
            <br /> {"Start: " + formattedDateStartTime}
            {formattedDateEndTime && (
                <>
                    <br /> {"End: " + formattedDateEndTime}
                </>
            )}
        </div>
    );
}

const WorkflowList = (props) => {
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [showMoveStageModal, setShowMoveStageModal] = useState(false);
    const [workflowData, setWorkflowData] = useState({});
    const [byjusGridRef, setByjusGridRef] = useState("");

    const onClickConfigWorkflowButton = (row) => {
        setShowConfigDialog(true);
        setWorkflowData(row);
    }

    const onClickMoveStageButton = (row) => {
        setShowMoveStageModal(true);
        setWorkflowData(row);
    }

    const getColumns = () => {
        const columns = [{
            dataField: 'date',
            text: 'Date',
            formatter: (cell, row) => {
                const overAllWorkflowStatus = get(row, 'overAllWorkflowStatus', "");
                const moveStageDisabled = overAllWorkflowStatus.includes("progress");

                return (
                    <>
                        {moment(cell).format('YYYY-MM-DD')} {" "}
                        <Button color="link" onClick={() => onClickConfigWorkflowButton(row)}>
                            <i className="fa fa-cogs" />
                        </Button>
                        {row.uploadTalktimeStatus === "upload_talktime_open" && (
                            <Button color="link" disabled={moveStageDisabled} onClick={() => onClickMoveStageButton(row)}>
                                <i className="fa fa-arrow-right" />
                            </Button>
                        )}
                    </>
                )
            }
        }, {
            dataField: "talktimeEligibility.forSystemAttendance",
            text: "Min TT for System Attendance(sec)"
        }, {
            dataField: "talktimeEligibility.forDisputeRaising",
            text: "Min TT for Dispute Raising(sec)"
        }, {
            dataField: "seedingStatus",
            text: "Seeding?",
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "seedingStatus");
            }
        }, {
            dataField: "meetingAttendanceStatus",
            text: "Meeting Attendance Status",
            width: '280px',
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "meetingAttendanceStatus");
            }
        }, {
            dataField: 'uploadTalktimeStatus',
            text: 'Upload Talktime Done?',
            width: '260px',
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "uploadTalktimeStatus");
            }
        }, {
            dataField: 'managerDisputeStatus',
            text: 'Manager Dispute Status',
            width: '260px',
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "managerDisputeStatus");
            }
        }, {
            dataField: 'agentDisputeStatus',
            text: 'Agent Dispute Status',
            width: '260px',
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "agentDisputeStatus");
            }
        }, {
            dataField: 'finalStatus',
            text: 'Final Status',
            width: '260px',
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "finalStatus");
            }
        }, {
            dataField: 'overAllWorkflowStatus',
            text: 'Over all Workflow Status',
            width: '260px',
        }, {
            dataField: 'updatedBy',
            text: 'Updated By',
            width: '260px'
        }, {
            dataField: 'updatedAt',
            text: 'Updated At',
            width: '260px',
            formatter: (cell, row) => {
                return row.updatedAt ? moment(new Date(row.updatedAt)).format('MMMM DD, YYYY h:mm A') : "";
            }

        }];

        return columns;
    }

    const getPills = () => {
        const previousDate = moment(new Date()).subtract(0, 'day').format('YYYY-MM-DD');

        return [{
            title: 'All',
            contextCriterias: []
        }, {
            title: 'Yet to Mark Attendance',
            contextCriterias: [{
                selectedColumn: 'meetingAttendanceStatus',
                selectedOperator: 'in',
                selectedValue: ['', null]
            }, {
                selectedColumn: 'date',
                selectedOperator: 'in',
                selectedValue: [previousDate]
            }]
        }, {
            title: 'Attended',
            contextCriterias: [{
                selectedColumn: 'meetingAttendanceStatus',
                selectedOperator: 'in',
                selectedValue: ['attended']
            }, {
                selectedColumn: 'date',
                selectedOperator: 'in',
                selectedValue: [previousDate]
            }]
        }, {
            title: 'Not Attended',
            contextCriterias: [
                {
                    selectedColumn: 'meetingAttendanceStatus',
                    selectedOperator: 'in',
                    selectedValue: ['not_attended']
                }, {
                    selectedColumn: 'date',
                    selectedOperator: 'in',
                    selectedValue: [previousDate]
                }
            ]
        }];
    }

    const columns = getColumns();
    const pills = getPills();

    return (
        <Box>
            <BoxBody>
                <ByjusGrid
                    ref={(item) => setByjusGridRef(item)}
                    gridDataUrl={`/usermanagement/supplychain/attendanceworkflow/list`}
                    columns={columns}
                    sort={{ date: -1 }}
                />
                {showConfigDialog && workflowData &&
                    <WorkflowConfigModal
                        byjusGridRef={byjusGridRef}
                        workflowData={workflowData}
                        closeModal={() => setShowConfigDialog(false)}
                    />
                }
                {showMoveStageModal && workflowData &&
                    <WorkflowMoveStageModal
                        byjusGridRef={byjusGridRef}
                        workflowData={workflowData}
                        closeModal={() => setShowMoveStageModal(false)}
                    />
                }
            </BoxBody>
        </Box>
    )
}

export default WorkflowList;
