import React, { useState } from 'react';
import { get, camelCase } from 'lodash';
import moment from 'moment';
import { Alert, Table } from "reactstrap";

import ModalWindow from 'components/modalWindow';

const SystemAttendanceEligibilityConfigModal = (props) => {

    const attendanceDate = get(props, 'workflowData.date');
    const wfhAttendanceConfig = get(props, 'workflowData.talktimeEligibility', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <ModalWindow
            heading={`${moment(attendanceDate).format('DD-MM-YYYY')} - System Attendance Eligibility Criteria`}
            closeModal={props.closeModal}
            showModal={true}
            addOkCancelButtons={false}
            okText="Update"
            loading={loading}
            error={error}
            size="lg"
            style={{ marginTop: "150px" }}
        >
            <>
                <Alert color="info">
                    Talktime is in seconds
            </Alert>
                <Table responsive>
                    <thead>
                        <tr>
                            <th>Type Of Vertical</th>
                            <th>Minimum Demo Sessions</th>
                            <th>Minimum Talktime</th>
                            <th>Minimum Connected Calls</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        Object.entries(wfhAttendanceConfig).map(([key, value]) => {
                            const formattedKey = camelCase(key);
                            if (key === "ds_weekend") {
                                const displayText = "Sales";
                                return (
                                    <>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>0</td>
                                            <td>{moment.utc((value.normalWorkflow.systemAttendanceTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.normalWorkflow.systemAttendanceConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[0].demoSessions}</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[0].systemAttendanceTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[0].systemAttendanceConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[1].demoSessions}</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[1].systemAttendanceTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[1].systemAttendanceConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[2].demoSessions}</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[2].systemAttendanceTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[2].systemAttendanceConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[3].demoSessions}+</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[3].systemAttendanceTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[3].systemAttendanceConnectedCalls}</td>
                                        </tr>
                                    </>
                                )
                            } else if (key === "pre_sales_team") {
                                const displayText = "Pre Sales";
                                return (
                                    <>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>0</td>
                                            <td>{moment.utc((value.normalWorkflow.systemAttendanceTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.normalWorkflow.systemAttendanceConnectedCalls}</td>
                                        </tr>
                                    </>
                                )
                            }
                        })
                    }
                    </tbody>
                </Table>
            </>
        </ModalWindow>
    )
}

export default SystemAttendanceEligibilityConfigModal;
