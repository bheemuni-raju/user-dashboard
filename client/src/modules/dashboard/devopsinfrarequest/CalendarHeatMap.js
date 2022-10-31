import React, { useEffect } from 'react';
import moment from 'moment';
import { get, lowerCase } from 'lodash';
import CalendarHeatmap from 'react-calendar-heatmap';
import ReactTooltip from 'react-tooltip';

import './CalendarHeatMap.css';

const CalendarHeatMap = (props) => {
    let { dateRange, calendarData } = props;
    let { start, end } = dateRange;
    let status = 'created';
    const titleStyle = { color: "#075d92", fontSize: "12px", paddingTop: "12px" };

    useEffect(() => {
        ReactTooltip.rebuild();
    });

    // To calculate the time difference of two dates
    const timeDifference = end._d.getTime() - start._d.getTime();

    // To calculate the no. of days between two dates
    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    const randomValues = getRange(dayDifference).map(index => {
        return {
            date: shiftDate(start._d, index),
            count: getCount(shiftDate(start._d, index), calendarData),
        };
    });

    return (
        <div>
            <h6 style={titleStyle} className="text-center">
                <strong>Day based count</strong>
            </h6>
            <CalendarHeatmap
                startDate={shiftDate(start._d, -150)}
                endDate={end._d}
                gutterSize={2}
                values={randomValues}
                classForValue={value => {
                    if (!value) {
                        return 'color-empty';
                    }
                    return `color-github-${value.count}`;
                }}
                tooltipDataAttrs={(value) => {
                    return {
                        'data-tip': (value.count != null) ? `${value.count
                            } request got ${status} on ${(value.date).toDateString()} ` : 'No data',
                    };
                }}
                showWeekdayLabels={true}
                showMonthLabels={true}
            />
            <ReactTooltip />
            <div className="description-scales">
                <div>Less</div>
                <div className="scales">
                    <div className="scale color-scale-0" ></div>
                    <div className="scale color-scale-1" ></div>
                    <div className="scale color-scale-2" ></div>
                    <div className="scale color-scale-3" ></div>
                    <div className="scale color-scale-4" ></div>
                </div>
                <div>More</div>
            </div>
        </div>
    );
}

function shiftDate(date, numDays) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);

    return newDate;
}

function getRange(count) {
    return Array.from({ length: count }, (_, i) => i);
}

function getCount(currentDate, calendarData) {
    let count = 0;
    currentDate = moment(currentDate).format('YYYY-MM-DD');
    //checking the date matches and returns the total count
    calendarData.map((data) => {
        let formattedDate = moment(data["created_at"]).format('YYYY-MM-DD');
        if (formattedDate === currentDate) {
            count++;
        }
    })

    return count;
}

export default CalendarHeatMap;