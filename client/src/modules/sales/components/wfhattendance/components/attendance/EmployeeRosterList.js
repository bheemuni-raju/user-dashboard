import React, { useState } from 'react';
import { startCase, upperCase } from 'lodash';
import moment from "moment";
import { Row, Col } from "reactstrap";

import { BoxBody, Box } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import DateRangePicker from 'components/DateRangePickerV2';

const EmployeeRosterList = () => {
    const currentDate = moment().format('YYYY-MM-DD');

    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);

    const getGridColumns = () => {
        const columns = [
            {
                dataField: "emailId",
                text: "Email ID",
                quickFilter: true
            },
            {
                dataField: "date",
                text: "Date",
                formatter: (cell, row) => {
                    return cell && moment(cell).format("DD-MM-YYYY");
                }
            },
            {
                dataField: "holidayType",
                text: "Holiday Type",
                formatter: (cell, row) => {
                    return cell && upperCase(startCase(cell));
                }
            },
            {
                dataField: "role",
                text: "Role",
                formatter: (cell, row) => {
                    return cell && upperCase(startCase(cell));
                },
                quickFilter: true
            },
            {
                dataField: "vertical",
                text: "Vertical",
                formatter: (cell, row) => {
                    return cell && upperCase(startCase(cell));
                },
                quickFilter: true
            }
        ];

        return columns;
    }

    const onClickDateRangePicker = (startDate, endDate) => {
        const startDateFormatted = moment(startDate).format('YYYY-MM-DD');
        const endDateFormatted = moment(endDate).format('YYYY-MM-DD');

        setStartDate(startDateFormatted);
        setEndDate(endDateFormatted);
    }

    const columns = getGridColumns();

    return (
        <Box>
            <BoxBody>
                <Row>
                    <Col md="6">
                    </Col>
                    <Col md={6}>
                        <div className="pull-right mb-2">
                            <DateRangePicker
                                onChangeDateRange={onClickDateRangePicker}
                                start={startDate}
                                end={endDate}
                            />
                        </div>
                    </Col>
                </Row>
                <ByjusGrid
                    gridDataUrl={`/usermanagement/wfhattendance/employeeRoster?startDate=${startDate}&endDate=${endDate}`}
                    columns={columns}
                    sort={{ date: -1 }}
                />
            </BoxBody>
        </Box>
    );
}

export default EmployeeRosterList;
