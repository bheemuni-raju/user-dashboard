import React, { useState } from "react";
import moment from "moment";
import { startCase, upperCase } from "lodash";
import { Row, Col } from "reactstrap";

import { BoxBody, Box } from "components/box";
import ByjusGrid from "modules/core/components/grid/ByjusGrid";
import DateRangePicker from 'components/DateRangePickerV2';

const TalktimeWebhookList = () => {
    const currentDate = moment().format('YYYY-MM-DD');

    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);

    const getGridColumns = () => {
        const columns = [
            {
                dataField: "callId",
                text: "Call ID",
                className: "td-header-info",
                quickFilter: true,
                width: 250
            },
            {
                dataField: "date",
                text: "Date",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell && moment(cell).format("DD-MM-YYYY");
                }
            },
            {
                dataField: "emailId",
                text: "Email",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell ? cell : "N/A";
                }
            },
            {
                dataField: "phoneNumber",
                text: "Phone Number",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell ? cell : "N/A";
                }
            },
            {
                dataField: "callStatus",
                text: "Call Status",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell ? cell : "N/A";
                }
            },
            {
                dataField: "duration",
                text: "Call Duration",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell;
                }
            },
            {
                dataField: "callStartTime",
                text: "Call Start Time",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell ? cell : "N/A";
                }
            },
            {
                dataField: "callEndTime",
                text: "Call End Time",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell ? cell : "N/A";
                }
            },
            {
                dataField: "provider",
                text: "Source",
                className: "td-header-warning",
                formatter: (cell, row) => {
                    return cell && startCase(upperCase(cell));;
                }
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
                    gridDataUrl={`/usermanagement/wfhtalktime/talktimeWebhookList?startDate=${startDate}&endDate=${endDate}`}
                    columns={columns}
                    sort={{ date: -1 }}
                />
            </BoxBody>
        </Box>
    );
}

export default TalktimeWebhookList;
