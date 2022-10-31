import React, { useState, useRef } from 'react';
import moment from "moment";
import { startCase, upperCase } from 'lodash';
import { Alert } from "reactstrap";

import { BoxBody, Box } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';

const TalkTimeSummary = (props) => {
    let searchFormRef = "";
    const baseUrl = `/usermanagement/wfhtalktime/talktimeSummary`;
    let [byjusGridRef, setByjusGridRef] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const currentDate = moment().format('YYYY-MM-DD');
    const [date, setDate] = useState(currentDate);
    const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState("");
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?date=${date}&selectedEmployeeEmail=${selectedEmployeeEmail}`);


    const getColumns = () => {
        const columns = [{
            dataField: "_id",
            text: "Provider",
            width: '250px',
            formatter: (cell, row) => {
                if(row._id === "TOTAL"){
                return (
                        <strong>{row._id}</strong>
                )}else{
                    return (<strong>
                        {upperCase(startCase(row._id))}
                        </strong>)
                }
            }
        }, {
            dataField: 'uniqueBDAcount',
            text: 'Unique BDA with call records',
            formatter: (cell, row) => {
                if(row._id === "TOTAL"){
                return (
                        <strong>{row.uniqueBDAcount}</strong>
                )}else{
                    return (row.uniqueBDAcount)
                }
            }
        }, {
            dataField: 'connectedCalls',
            text: 'Connected Calls',
            formatter: (cell, row) => {
                if(row._id === "TOTAL"){
                return (
                    <strong>{row.connectedCalls}</strong>
                )}else{
                    return (row.connectedCalls)
                }
            }
        }, {
            dataField: 'eligibleCall',
            text: 'Eligible Connected Calls',
            formatter: (cell, row) => {
                if(row._id === "TOTAL"){
                return (
                    <strong>{row.eligibleCall}</strong> 
                )}else{
                    return (row.eligibleCall)
                }
            }
        }, {
            dataField: 'zeroDurationCall',
            text: 'Records with zero duration',
            formatter: (cell, row) => {
                if(row._id === "TOTAL"){
                return (
                    <strong>{row.zeroDurationCall}</strong>
                )}else{
                    return (row.zeroDurationCall)
                }
            }
        },
        {
            dataField: 'noEmailId',
            text: 'Records with no email',
            formatter: (cell, row) => {
                if(row._id === "TOTAL"){
                return (
                    <strong>{row.noEmailId}</strong>
                )}else{
                    return (row.noEmailId)
                }
            }
        },
        {
            dataField: 'totalTalkTime',
            text: 'Total Talkime',
            formatter: (cell, row) => {
                if(row._id === "TOTAL"){
                    return (
                        <strong>{(Math.floor(row.totalTalkTime / 3600)) + ":" + ("0" + Math.floor(row.totalTalkTime / 60) % 60).slice(-2) + ":" + ("0" + row.totalTalkTime % 60).slice(-2)}</strong>

                    )} else {
                    return (Math.floor(row.totalTalkTime / 3600)) + ":" + ("0" + Math.floor(row.totalTalkTime / 60) % 60).slice(-2) + ":" + ("0" + row.totalTalkTime % 60).slice(-2)
                }
            },
            sorting: false,
        }, {
            dataField: 'highestTalktime',
            text: 'Highest Talktime',
            formatter: (cell, row) => {
                if (row._id === "TOTAL") {
                    return (
                    <strong>{"-"}</strong>)
                } else {
                    return (Math.floor(row.highestTalktime / 3600)) + ":" + ("0" + Math.floor(row.highestTalktime / 60) % 60).slice(-2) + ":" + ("0" + row.highestTalktime % 60).slice(-2)
                }
            },
            sorting: false,
        }];

        return columns;
    }
    const onClickSearch = () => {
        setGridDataUrl(`${baseUrl}/?date=${date}&selectedEmployeeEmail=${selectedEmployeeEmail}`);
    }

    const onChangeEmployee = (value, name) => {
        setSelectedEmployeeEmail(value || "");
    }

    const onChangeDate = (value, name) => {
        if (name === "date") {
            setDate(value);
        }
    }

    const getSearchFields = () => {
        return [{
            type: 'date',
            name: 'date',
            value: date,
            onChange: onChangeDate
        }, {
            type: "select",
            name: "email",
            model: "Employee",
            filter: { subDepartment: "sales", role: ['bdt', 'bdat', 'bda'] },
            placeholder: 'Enter Email',
            onChange: onChangeEmployee,
            displayKey: "email",
            valueKey: "email"
        }, {
            type: 'button',
            text: 'Search',
            onClick: onClickSearch
        }];
    }

    const columns = getColumns();
    const fields = getSearchFields();


    return (
        <Box>
            <BoxBody loading={loading} error={error} >
                <FormBuilder
                    ref={element => (searchFormRef = element)}
                    fields={fields}
                    initialValues={{
                        date,
                    }}
                    cols={4}
                />
                <Alert color="info">
                <li>Unique BDA with call records - Number of BDAs</li>
                <li>Eligible Connected Calls - Calls greater than 90 sec / 30 min (Customer Demo Sessions)</li>  
            </Alert>
                <ByjusGrid
                    ref={element => setByjusGridRef(element)}
                    gridDataUrl={gridDataUrl}
                    columns={columns}
                    sort={{ date: -1 }}
                />
            </BoxBody>
        </Box>
    )
}

export default TalkTimeSummary;
