import React, { useState } from 'react';
import moment from 'moment';
import { get, startCase } from 'lodash';
import { Button, Row, Col, Alert } from "reactstrap";

import { BoxBody, Box } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';

const AgentReconciliation = (props) => {
    let serachFormRef = "";
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().format('YYYY-MM-DD');
    const baseUrl = `/usermanagement/agentreconciliation/getReconciliationList`;
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [selectedReportingManager, setSelectedReportingManager] = useState("");
    const [rowData, setRowData] = useState({});
    const [error, setErrorMessage] = useState(null);
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?date=${selectedDate}`);

    const getColumns = () => {
        const columns = [{
            dataField: 'email',
            text: 'Email Id',
            quickFilter: true
        }, {
            dataField: 'entity',
            text: 'Field',
            quickFilter: true,
            formatter : (row, cell) => {
                return get(cell,"change.entity","");
            }
        }, {
            dataField: "oldValue",
            text: "Old Value",
            quickFilter: true,
            formatter : (row, cell) => {
                return get(cell,"change.oldValue","");
            }
        }, {
            dataField: "newValue",
            text: "Updated Value",
            quickFilter: true,
            formatter : (row, cell) => {
                return get(cell,"change.newValue","");
            }
        },{
            dataField: "reconciledAt",
            text: "Reported At",
            quickFilter: true,
            formatter : (row, cell) => {
                const { reconciledAt = ""} = cell;
                return cell ? moment(reconciledAt).format("DD-MM-YYYY HH:mm:ss") : "";
            }
        },{
            dataField: "agentStatus",
            text: "Agent Status",
            quickFilter: true,
            formatter : (row, cell) => {
                const { agentStatus } = cell;
                return cell ? startCase(agentStatus): "N/A";
            }
        }, {
            dataField: "requestedValue",
            text: "Requested Value",
            quickFilter: true,
            formatter : (row, cell) => {
                const requestedValue = get(cell,"change.requestedValue","");
                return startCase(requestedValue);
            }
        }];

        return columns;
    }

    const onClickSearch = () => {
        setGridDataUrl(`${baseUrl}/?date=${selectedDate}&reportingManagerEmailId=${selectedReportingManager}`);
    }

    const onChangeDate = (value, name) => {
        setSelectedDate(value);
    }

    const getSearchFields = () => {
        return [{
            type: 'date',
            name: 'selectedDate',
            value: selectedDate,
            onChange: onChangeDate
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
                    sort={{ emailId: 1 }}
                    error={error}
                />
            </BoxBody>
        </Box>
    );
}

export default AgentReconciliation;
