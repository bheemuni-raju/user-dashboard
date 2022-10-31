import React, { useState } from 'react';
import moment from 'moment';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Alert } from "reactstrap";

import { BoxBody, Box } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

import WorkflowConfigModal from './WorkflowConfigModal';
import WorkflowMoveStageModal from './WorkflowMoveStageModal';
import WorkflowTalktimeConfigModal from './WorkflowTalktimeConfigModal';
import WorkflowOnBoardingConfigModal from './WorkflowOnBoardingConfigModal';
import SystemAttendanceEligibilityConfigModal from './SystemAttendanceEligibilityConfigModal';
import ManagerDisputeRaiseEligibilityConfigModal from './ManagerDisputeRaiseEligibilityConfigModal';
import SalesPersonDisputeRaiseEligibilityModal from './SalesPersonDisputeRaiseEligibilityModal';

import ByjusDropdown from 'components/ByjusDropdown';

const timestampsKeyMap = {
    "seedingStatus": "seedingAt",
    "meetingAttendanceStatus": { start: "meetingAttendanceStartingAt", end: "meetingAttendanceLockingAt" },
    "uploadTalktimeStatus": { start: "uploadTalktimeStartingAt", end: "uploadTalktimeLockingAt" },
    "managerDisputeStatus": { start: "managerDisputeStartingAt", end: "managerDisputeLockingAt" },
    "bdaDisputeStatus": { start: "bdaDisputeStartingAt", end: "bdaDisputeLockingAt" },
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
            formattedDateStartTime = row[timestampKey.start] ? moment(row[timestampKey.start]).utc().format('MMMM DD, YYYY h:mm A') : "";
            formattedDateEndTime = row[timestampKey.end] ? moment(row[timestampKey.end]).utc().format('MMMM DD, YYYY h:mm A') : "";
        } else {
            formattedDateStartTime = row[timestampKey] ? moment(row[timestampKey]).utc().format('MMMM DD, YYYY h:mm A') : "";
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
    const { user } = props;
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [showMoveStageModal, setShowMoveStageModal] = useState(false);
    const [showTalktimeConfigModal, setShowTalktimeConfigModal] = useState(false);
    const [showOnBoardingConfigModal, setOnBoardingConfigModal] = useState(false);
    const [showSystemAttendanceEligibilityConfigModal, setSystemAttendanceEligibilityConfigModal] = useState(false);
    const [showManagerDisputeRaiseEligibilityConfigModal, setManagerDisputeRaiseEligibilityConfigModal] = useState(false);
    const [showSalesPersonDisputeRaiseEligibilityConfigModal, setSalesPersonDisputeRaiseEligibilityModal] = useState(false);
    const [workflowData, setWorkflowData] = useState({});
    const [byjusGridRef, setByjusGridRef] = useState("");

    const onClickConfigWorkflowButton = (row) => {
        setShowConfigDialog(true);
        setWorkflowData(row);
    }

    const onClickTalktimeConfigWorkflowButton = (row) => {
        setShowTalktimeConfigModal(true);
        setWorkflowData(row);
    }

    const onClickWfhAttendanceConfigButton = (row, configType) => {
        console.log("onClickWfhAttendanceConfigButton -> row", row)
        const talktimeEligibility = get(row, "talktimeEligibility");
        console.log("onClickWfhAttendanceConfigButton -> talktimeEligibility", talktimeEligibility)

        if (configType === "systemAttendance") {
            setSystemAttendanceEligibilityConfigModal(true);
            setWorkflowData(row);
        } else if (configType === "managerDispute") {
            setManagerDisputeRaiseEligibilityConfigModal(true);
            setWorkflowData(row);
        } else if (configType === "salesPersonDispute") {
            setSalesPersonDisputeRaiseEligibilityModal(true);
            setWorkflowData(row);
        }
    }

    const onClickOnBoardingConfigWorkflowButton = (row) => {
        setOnBoardingConfigModal(true);
        setWorkflowData(row);
    }

    const onClickMoveStageButton = (row) => {
        setShowMoveStageModal(true);
        setWorkflowData(row);
    }
    const canEnableManagerDispute = (row) => row.uploadTalktimeStatus === "upload_talktime_open" ? true : false;

    const canDisplayEditTalktime = user.env === "development" || user.env === "local";

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
                    </>
                )
            }
        }, {
            dataField: "actions",
            sort: false,
            text: "Actions",
            formatter: (cell, row) => {
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={[{
                            title: 'Edit Timeflow',
                            icon: 'fa fa-cogs',
                            onClick: () => onClickConfigWorkflowButton(row),
                        }, {
                            title: 'Edit Talktime',
                            icon: 'fa fa-cog',
                            onClick: () => onClickTalktimeConfigWorkflowButton(row),
                            isAllowed: canDisplayEditTalktime
                        }, {
                            title: 'System Attendance Eligibility Criteria',
                            icon: 'fa fa-cog',
                            onClick: () => onClickWfhAttendanceConfigButton(row, "systemAttendance"),
                            isAllowed: true
                        }, {
                            title: 'Manager Dispute Raise Eligibility Criteria',
                            icon: 'fa fa-cog',
                            onClick: () => onClickWfhAttendanceConfigButton(row, "managerDispute"),
                            isAllowed: true
                        }, {
                            title: 'Sales Person Dispute Raise Eligibility Criteria',
                            icon: 'fa fa-cog',
                            onClick: () => onClickWfhAttendanceConfigButton(row, "salesPersonDispute"),
                            isAllowed: true
                        }, {
                            title: 'Enable Manager Dispute',
                            icon: 'fa fa-arrow-right',
                            onClick: () => onClickMoveStageButton(row),
                            isAllowed: canEnableManagerDispute(row)
                        }, {
                            title: 'Is Onboarding Day ?',
                            icon: 'fa fa-cog',
                            onClick: () => onClickOnBoardingConfigWorkflowButton(row),
                        }
                        ]} />
                );
            }
        },
        {
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
        },
        {
            dataField: 'managerDisputeStatus',
            text: 'Manager Dispute Status',
            width: '260px',
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "managerDisputeStatus");
            }
        }, {
            dataField: 'bdaDisputeStatus',
            text: 'BDA Dispute Status',
            width: '260px',
            formatter: (cell, row) => {
                return checkFormatter(cell, row, "bdaDisputeStatus");
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

        if (user.env === "development" || user.env === "local") {
            columns.splice(5, 0,
                {
                    dataField: 'uploadDemoSessionStatus',
                    text: 'Upload Demo Session Done?',
                    width: '260px',
                    formatter: (cell, row) => {
                        return checkFormatter(cell, row, "uploadDemoSessionStatus");
                    }
                }
            );
        }

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
                <Alert>
                    1. Only calls with duration more than 90 seconds are considered as a Connected Call.<br></br>
                    2. Only Zoom meetings with duration more than 30 minutes is counted under Demo Sessions.
                </Alert>
                <ByjusGrid
                    ref={(item) => setByjusGridRef(item)}
                    gridDataUrl={`/usermanagement/wfhattendanceworkflow/list`}
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
                {showTalktimeConfigModal && workflowData &&
                    <WorkflowTalktimeConfigModal
                        byjusGridRef={byjusGridRef}
                        workflowData={workflowData}
                        closeModal={() => setShowTalktimeConfigModal(false)}
                    />
                }
                {showSystemAttendanceEligibilityConfigModal && workflowData &&
                    <SystemAttendanceEligibilityConfigModal
                        byjusGridRef={byjusGridRef}
                        workflowData={workflowData}
                        closeModal={() => setSystemAttendanceEligibilityConfigModal(false)}
                    />
                }

                {showManagerDisputeRaiseEligibilityConfigModal && workflowData &&
                    <ManagerDisputeRaiseEligibilityConfigModal
                        byjusGridRef={byjusGridRef}
                        workflowData={workflowData}
                        closeModal={() => setManagerDisputeRaiseEligibilityConfigModal(false)}
                    />
                }
                {showSalesPersonDisputeRaiseEligibilityConfigModal && workflowData &&
                    <SalesPersonDisputeRaiseEligibilityModal
                        byjusGridRef={byjusGridRef}
                        workflowData={workflowData}
                        closeModal={() => setSalesPersonDisputeRaiseEligibilityModal(false)}
                    />
                }
                {showOnBoardingConfigModal && workflowData &&
                    <WorkflowOnBoardingConfigModal
                        byjusGridRef={byjusGridRef}
                        workflowData={workflowData}
                        closeModal={() => setOnBoardingConfigModal(false)}
                    />
                }
            </BoxBody>
        </Box>
    )
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(WorkflowList);