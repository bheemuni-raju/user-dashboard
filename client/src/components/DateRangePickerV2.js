import React, { useState, useEffect } from 'react';
import moment from 'moment';
import ReactDateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';

const DateRangePicker = (props) => {
    const start = props.start ? moment(props.start) : moment().add(-7, "days").add(330, 'minutes');
    const end = props.end ? moment(props.end) : moment().add(6, "days").add(331, 'minutes');
    const [startDate, setStartDate] = useState(start);
    const [endDate, setEndDate] = useState(end);

    const onChangeDateRange = (start, end) => {
        setStartDate(start);
        setEndDate(end);
        props.onChangeDateRange && props.onChangeDateRange(start, end);
    };

    const label = startDate.format('MMM D, YYYY') + ' - ' + endDate.format('MMM D, YYYY');

    return (
        <ReactDateRangePicker
            initialSettings={{
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
                ranges: {
                    Today: [moment().toDate(), moment().toDate()],
                    Yesterday: [
                        moment().subtract(1, 'days').toDate(),
                        moment().subtract(1, 'days').toDate(),
                    ],
                    'Last 7 Days': [
                        moment().subtract(6, 'days').toDate(),
                        moment().toDate(),
                    ],
                    'Last 30 Days': [
                        moment().subtract(29, 'days').toDate(),
                        moment().toDate(),
                    ],
                    'This Month': [
                        moment().startOf('month').toDate(),
                        moment().endOf('month').toDate(),
                    ],
                    'Last Month': [
                        moment().subtract(1, 'month').startOf('month').toDate(),
                        moment().subtract(1, 'month').endOf('month').toDate(),
                    ],
                },
            }}
            onCallback={(start, end, label) => onChangeDateRange(start, end, label, "createdAt")}>
            <div
                style={{
                    background: '#fff',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    border: '1px solid #ccc',
                    width: '100%',
                }}
            >
                <i className="fa fa-calendar"></i>&nbsp;
                <span>{label}</span>
                <i className="fa fa-caret-down"></i>
            </div>
        </ReactDateRangePicker>
    );
}

export default DateRangePicker;
