module.exports =
        {
            "sales":{
                weekoff: ["monday", "tuesday"],
                demoSessionsWorkflows: [
                    {
                        demoSessions: 1,
                        systemAttendanceTalktime: 5400,
                        systemAttendanceConnectedCalls: 15,
                        managerDisputeTalktime: 0,
                        managerDisputeConnectedCalls: 0,
                        agentDisputeTalktime: 3600,
                        agentDisputeConnectedCalls: 0
                    },
                    {
                        demoSessions: 2,
                        systemAttendanceTalktime: 3600,
                        systemAttendanceConnectedCalls: 10,
                        managerDisputeTalktime: 0,
                        managerDisputeConnectedCalls: 0,
                        agentDisputeTalktime: 1800,
                        agentDisputeConnectedCalls: 0
                    },
                    {
                        demoSessions: 3,
                        systemAttendanceTalktime: 1800,
                        systemAttendanceConnectedCalls: 5,
                        managerDisputeTalktime: 0,
                        managerDisputeConnectedCalls: 0,
                        agentDisputeTalktime: 0,
                        agentDisputeConnectedCalls: 0
                    },
                    {
                        demoSessions: 4,
                        systemAttendanceTalktime: 0,
                        systemAttendanceConnectedCalls: 0,
                        managerDisputeTalktime: 0,
                        managerDisputeConnectedCalls: 0,
                        agentDisputeTalktime: 0,
                        agentDisputeConnectedCalls: 0
                    },
                ],
                normalWorkflow: {
                    systemAttendanceTalktime: 7200,
                    systemAttendanceConnectedCalls: 20,
                    managerDisputeTalktime: 0,
                    managerDisputeConnectedCalls: 0,
                    agentDisputeTalktime: 5400,
                    agentDisputeConnectedCalls: 0
                }
            },
            "pre_sales":{
                weekoff: ["sunday", "monday"],
                normalWorkflow: {
                    systemAttendanceTalktime: 10800,
                    systemAttendanceConnectedCalls: 0,
                    managerDisputeTalktime: 0,
                    managerDisputeConnectedCalls: 0,
                    agentDisputeTalktime: 9000,
                    agentDisputeConnectedCalls: 0
                }
            },
        };