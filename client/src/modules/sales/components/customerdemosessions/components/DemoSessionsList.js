import React, { useState } from 'react';
import moment from 'moment';

import { BoxBody, Box } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

const DemoSessions = (props) => {
    let serachFormRef = "";
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const baseUrl = `/usermanagement/customerdemosessions/list`;
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [selectedReportingManager, setSelectedReportingManager] = useState("");
    const [setShowActionModal] = useState(false);
    const [rowData, setRowData] = useState({});
    const [error, setErrorMessage] = useState(null);
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?date=${selectedDate}`);

    const getColumns = () => {
        const columns = [{
            dataField: 'date',
            text: 'Date'
        }, {
            dataField: "email",
            text: "Employee Email",
            width: '250px',
            quickFilter: true
        }, {
            dataField: "meetingId",
            text: "Meeting Id",
            quickFilter: true
        }, {
            dataField: "topic",
            text: "Topic",
            quickFilter: true
        },
        {
            dataField: "meetingUrl",
            text: "Meeting URL",
            quickFilter: true
        }, {
            dataField: "schedule",
            text: "Schedule",
            quickFilter: true
        }, {
            dataField: "host",
            text: "Host",
            quickFilter: true
        }, {
            dataField: "numberOfAttendees",
            text: "Number Of Attendees"
        }, {
            dataField: "scheduledDuration",
            text: "Scheduled Duration"
        }, {
            dataField: "recordingShareUrl",
            text: "Recording Share Url",
            quickFilter: true
        }, {
            dataField: "actualDuration",
            text: "Actual Duration"
        }, {
            dataField: "meetingStartTime",
            text: "Meeting Start Time"
        }, {
            dataField: "meetingEndTime",
            text: "Meeting End Time"
        }, {
            dataField: "status",
            text: "Status",
            quickFilter: true
        }, {
            dataField: "meetingProvider",
            text: "Meeting Provider",
            quickFilter: true
        }];

        return columns;
    }

    const getPills = () => {
        return [{
            title: 'All',
            contextCriterias: []
        }
        ];
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

export default DemoSessions;
