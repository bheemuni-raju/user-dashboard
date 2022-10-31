import React, { useState } from 'react';
import moment from 'moment';
import { Row, Col } from "reactstrap";

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import DateRangePicker from 'components/DateRangePicker';

const DayOffList = (props) => {
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().format('YYYY-MM-DD');
    const baseUrl = `/usermanagement/supplychain/dayoff/list`;
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?from=${currentDate}&to=${currentDate}`);
    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);

    const getColumns = () => {
        const columns = [{
            dataField: 'date',
            text: 'Date'
        }, {
            dataField: "emailId",
            text: "Employee Email",
            width: '250px',
            quickFilter: true
        }, {
            dataField: "type",
            text: "Leave Type",
            quickFilter: true
        }, {
            dataField: "createdAt",
            text: "Created At",
            formatter: (cell) => {
                return cell && moment(cell).format("DD-MM-YYYY hh:mm:ss A");
            }
        }, {
            dataField: "updatedAt",
            text: "Updated At",
            formatter: (cell) => {
                return cell && moment(cell).format("DD-MM-YYYY hh:mm:ss A");
            }
        }];

        return columns;
    }

    const getPills = () => {
        return [{
            title: 'All',
            contextCriterias: []
        }];
    }

    const onClickDateRangePicker = ({ startDate, endDate }) => {
        const startDateFormatted = moment(startDate).format('YYYY-MM-DD');
        const endDateFormatted = moment(endDate).format('YYYY-MM-DD');

        setStartDate(startDateFormatted);
        setEndDate(endDateFormatted);
        setGridDataUrl(`${baseUrl}/?from=${startDateFormatted}&to=${endDateFormatted}`);
    }

    const columns = getColumns();
    const pills = getPills();

    return (
        <Box>
            <BoxBody>
                <Row>
                    <Col md="6">
                    </Col>
                    <Col md={6}>
                        <div className="pull-right mb-2">
                            <DateRangePicker onClick={onClickDateRangePicker} />
                        </div>
                    </Col>
                </Row>
                <ByjusGrid
                    ref={element => setByjusGridRef(element)}
                    gridDataUrl={gridDataUrl}
                    columns={columns}
                    pillOptions={{
                        pills
                    }}
                    sort={{ emailId: 1 }}
                />
            </BoxBody>
        </Box>
    )
}

export default DayOffList;
