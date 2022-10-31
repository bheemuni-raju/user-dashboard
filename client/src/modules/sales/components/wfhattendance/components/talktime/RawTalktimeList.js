import React, { useState } from 'react';
import { isEmpty, startCase, upperCase } from 'lodash';
import moment from "moment";

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';

const RawTalktimeList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextCriterias, setContextCriterias] = useState([{
        selectedColumn: "callId",
        selectedOperator: "exists",
        selectedValue: "",
    }]);
    const [date, setDate] = useState(moment().subtract(1, 'days').format("YYYY-MM-DD"));

    const getColumns = () => {
        const columns = [{
            dataField: "callId",
            text: "Call ID",
            className: "td-header-info",
        }, {
            dataField: "emailId",
            text: "Email ID",
            className: "td-header-info",
            formatter: (cell, row) => {
                return !isEmpty(cell) ? cell : "N/A";
            }
        }, {
            dataField: "phone",
            text: "Phone Number",
            className: "td-header-warning",
            formatter: (cell, row) => {
                return !isEmpty(cell) ? cell : "N/A";
            }
        }, {
            dataField: "date",
            text: "Date",
            className: "td-header-warning",
            formatter: (cell, row) => {
                return cell && moment(cell).format("DD-MM-YYYY")
            }
        }, {
            dataField: "duration",
            text: "Call Duration",
            className: "td-header-warning",
            formatter: (cell, row) => {
                return cell && moment.utc(cell * 1000).format('HH:mm:ss');
            }
        }, {
            dataField: "connectedCallCriteria",
            text: "Connected Call Criteria",
            width: 250,
            className: "td-header-warning",
            formatter: (cell, row) => {
                return cell && moment.utc(cell * 1000).format('HH:mm:ss');
            }
        }, {
            dataField: "isConnectedCall",
            text: "Is Connected Call?",
            className: "td-header-warning",
            formatter: (cell, row) => {
                return cell ? "YES" : "NO"
            }
        }, {
            dataField: "source",
            text: "Source",
            className: "td-header-warning",
            formatter: (cell, row) => {
                return startCase(upperCase(cell));
            }
        }, 
        // {
        //     dataField: "startTime",
        //     text: "Call Start Time",
        //     className: "td-header-warning",
        // }, {
        //     dataField: "endTime",
        //     text: "Call End Time",
        //     className: "td-header-warning",
        // }, 
        {
            dataField: "isMapped",
            text: "Is Mapped",
            className: "td-header-warning",
            formatter: (cell, row) => {
                return cell ? "YES" : "NO"
            }
        }];

        return columns;
    }

    const onChangeDate = (value) => {
        setDate(moment(value).format("YYYY-MM-DD"));
    }

    const getSearchFields = () => {
        const fields = [
            {
                type: 'date',
                name: 'date',
                label: 'Select Date',
                onChange: onChangeDate
            }
        ]
        return fields;
    }

    const getPills = () => {
        const pills = [{
            title: "All",
            contextCriterias: [{
                selectedColumn: "source",
                selectedOperator: "in",
                selectedValue: ["ameyo_web", "ameyo_ivr", "knowlarity_web"]
            }]
        }, {
            title: "Ameyo Web",
            contextCriterias: [{
                selectedColumn: "source",
                selectedOperator: "in",
                selectedValue: ["ameyo_web"]
            }]
        }, {
            title: "Ameyo IVR",
            contextCriterias: [{
                selectedColumn: "source",
                selectedOperator: "in",
                selectedValue: ["ameyo_ivr"]
            }]
        }, {
            title: "Knowlarity Web",
            contextCriterias: [{
                selectedColumn: "source",
                selectedOperator: "in",
                selectedValue: ["knowlarity_web"]
            }]
        }];
        return pills;
    }

    const columns = getColumns();
    const pills = getPills();

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <FormBuilder
                    fields={getSearchFields()}
                    initialValues={{
                        date,
                        source: "all"
                    }}
                    cols={4}
                />
                <ByjusGrid
                    gridDataUrl={`/usermanagement/wfhtalktime/rawTalktimeList?selectedDate=${date}`}
                    columns={columns}
                    contextCriterias={contextCriterias}
                    sort={{ date: -1 }}
                    pillOptions={{
                        pills,
                    }}
                />
            </BoxBody>
        </Box>
    );
}

export default RawTalktimeList;
