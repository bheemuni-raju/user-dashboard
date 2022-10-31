import React, { useState } from 'react';
import moment from 'moment';

import ByjusDropdown from 'components/ByjusDropdown';

const DateRangePicker = (props) => {
    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment());
    const formattedDate = `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`;
    const [defaultTitle, setDefaultTitle] = useState(formattedDate);

    const onClickDateRange = (rangeValue) => {
        let displayDate, startDate, endDate;

        if (rangeValue === "today") {
            startDate = moment();
            endDate = moment();
        }
        else if (rangeValue === "yesterday") {
            startDate = moment().subtract(1, 'day');
            endDate = moment().subtract(1, 'day');
        }
        else if (rangeValue === "last_7_days") {
            startDate = moment().subtract(7, 'day');
            endDate = moment();
        }
        else if (rangeValue === "last_30_days") {
            startDate = moment().subtract(30, 'day');
            endDate = moment();
        }
        else if (rangeValue === `this_month`) {
            startDate = moment().startOf('month');
            endDate = moment().endOf('month');
        }
        else if (rangeValue === `last_month`) {
            startDate = moment().subtract(1, 'month').startOf('month');
            endDate = moment().subtract(1, 'month').endOf('month');
        }
        displayDate = `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`;
        setDefaultTitle(displayDate);
        setStartDate(startDate);
        setEndDate(endDate);
        props.onClick && props.onClick({ startDate, endDate });
    }

    return (
        <ByjusDropdown
            defaultTitle={defaultTitle}
            type="simple"
            titleIcon="fa fa-calendar"
            items={[{
                title: 'Today',
                onClick: () => onClickDateRange("today"),
                isAllowed: true
            }, {
                title: 'Yesterday',
                onClick: () => onClickDateRange("yesterday"),
                isAllowed: true
            }, {
                title: 'Last 7 Days',
                onClick: () => onClickDateRange("last_7_days"),
                isAllowed: true
            }, {
                title: 'Last 30 Days',
                onClick: () => onClickDateRange("last_30_days"),
                isAllowed: true
            }, {
                title: 'This Month',
                onClick: () => onClickDateRange("this_month"),
                isAllowed: true
            }, {
                title: 'Last Month',
                onClick: () => onClickDateRange("last_month"),
                isAllowed: true
            }]} />
    )
}

export default DateRangePicker;