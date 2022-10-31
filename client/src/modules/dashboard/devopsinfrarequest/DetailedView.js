import React from 'react';
import {
    ResponsiveContainer, ComposedChart, Area, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell
} from 'recharts';
import moment from 'moment';
import { get, startCase } from 'lodash';

const AllTicketsDetailedView = (props) => {
    let { graphData, groupBy } = props;
    const titleStyle = { color: "#075d92", fontSize: "12px", paddingTop: "12px" };

    graphData = graphData.map((data, index) => {
        const idVal = get(data, '_id', "");
        data["key"] = (groupBy && groupBy.includes('_at')) ? moment(idVal).format('DD-MMM') : `${idVal ? startCase(idVal.split('.')[0]) : idVal}`;

        return data;
    });

    const CustomizedAxisTick = (props) => {
        const { x, y, payload, width, maxChars, lineHeight, fontSize, fill } = props;
        const rx = new RegExp(`.{1,${maxChars}}`, 'g');
        const chunks = payload.value.replace(/-/g, ' ').split(' ').map(s => s.match(rx)).flat();
        const tspans = chunks.map((s, i) => <tspan key={i} x={0} y={lineHeight} dy={(i * lineHeight)}>{s}</tspan>);
        let i = 0;
        return (
            <g transform={`translate(${x},${y})`}>
                <text width={width} height="auto" textAnchor="middle" fontSize={fontSize} fill={fill}>
                    {tspans}
                </text>
            </g>
        );
    }

    CustomizedAxisTick.defaultProps = {
        width: 50,
        maxChars: 25,
        fontSize: 12,
        lineHeight: 14,
        fill: "#333"
    };

    const COLORS = ['#FFBB28', '#0088FE', '#2596BE', '#00C49F', '#E91404'];

    return (
        <>
            <h6 style={titleStyle} className="text-center">
                <strong>Count based view</strong>
            </h6>
            <div>
                {graphData &&
                    <ResponsiveContainer height={250}>
                        <BarChart width={600} height={300} data={graphData} barSize={20}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="key" height={60} tick={<CustomizedAxisTick />} />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalRequests" name={"Count"} stackId="a" fill={"#00C49F"} />
                            {/* {groupBy == "created_at" ?
                                <>
                                    <Bar dataKey="createdRequests" name="Created" stackId="a" fill="#FFBB28" />
                                    <Bar dataKey="approvedRequests" name="Approved" stackId="a" fill="#0088FE" />
                                    <Bar dataKey="deployedRequests" name="Deployed" stackId="a" fill="#2596BE" />
                                    <Bar dataKey="smokeTestedRequests" name="Smoke Tested" stackId="a" fill="#00C49F" />
                                    <Bar dataKey="rejectedRequests" name="Rejected" stackId="a" fill="#E91404" />
                                </> :
                                <Bar dataKey="totalRequests" name={"Count"} stackId="a" fill={"#00C49F"} />
                            } */}
                        </BarChart>
                    </ResponsiveContainer>}
            </div>
        </>
    );
}

export default AllTicketsDetailedView;