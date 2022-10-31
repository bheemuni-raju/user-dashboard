import React, { useState } from 'react';
import { get, camelCase } from 'lodash';
import moment from 'moment';
import { Alert, Table } from "reactstrap";

import ModalWindow from 'components/modalWindow';

const ManagerDisputeRaiseEligibilityConfigModal = (props) => {
    const attendanceDate = get(props, 'workflowData.date');
    const wfhAttendanceConfig = get(props, 'workflowData.talktimeEligibility', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <ModalWindow
            heading={`${moment(attendanceDate).format('DD-MM-YYYY')} -Manager Dispute Raise Eligibility Criteria`}
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
                            if (key === "ds_weekend") {
                                const displayText = "Sales";
                                return (
                                    <>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>0</td>
                                            <td>{moment.utc((value.normalWorkflow.managerDisputeTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.normalWorkflow.managerDisputeConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[0].demoSessions}</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[0].managerDisputeTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[0].managerDisputeConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[1].demoSessions}</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[1].managerDisputeTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[1].managerDisputeConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[2].demoSessions}</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[2].managerDisputeTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[2].managerDisputeConnectedCalls}</td>
                                        </tr>
                                        <tr>
                                            <td>{displayText}</td>
                                            <td>{value.demoSessionsWorkflows[3].demoSessions}+</td>
                                            <td>{moment.utc((value.demoSessionsWorkflows[3].managerDisputeTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.demoSessionsWorkflows[3].managerDisputeConnectedCalls}</td>
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
                                            <td>{moment.utc((value.normalWorkflow.managerDisputeTalktime) * 1000).format("HH:mm:ss")}</td>
                                            <td>{value.normalWorkflow.managerDisputeConnectedCalls}</td>
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

export default ManagerDisputeRaiseEligibilityConfigModal;
