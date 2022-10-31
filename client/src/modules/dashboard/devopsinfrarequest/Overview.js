import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import moment from 'moment';
import {
    ResponsiveContainer, Tooltip, Legend, Cell, Pie, PieChart
} from 'recharts';

const Overview = (props) => {
    const { loanVendor } = props;
    const { start, end } = props.dateRange || {};
    const startDate = moment(start).format('YYYY-MM-DD');
    const endDate = moment(end).format('YYYY-MM-DD');
    let tableData = props.tableData && props.tableData[0];
    Object.keys(tableData).map((key) => { tableData[key] = Number(tableData[key]) });
    const titleStyle = { color: "#075d92", fontSize: "12px", paddingTop: "12px" };

    const columns = [{
        text: 'Total',
        dataField: "totalRequests",
        color: "#EA1FE3"
    }, {
        text: 'Created',
        dataField: "createdRequests",
        status: ["created"],
        color: "#FFBB28"
    }, {
        text: 'Approved',
        dataField: "approvedRequests",
        status: ["approved"],
        color: "#EA1FE3"
    }, {
        text: 'In Progress',
        dataField: "inProgressRequests",
        status: ["in_progress"],
        color: "#2596BE"
    }, {
        text: 'Deployed',
        dataField: "deployedRequests",
        status: ["deployed"],
        color: "orange"
    }, {
        text: 'Smoke Tested',
        dataField: "smokeTestedRequests",
        status: ["smoke_tested"],
        color: "#00C49F"
    }, {
        text: 'Rejected',
        dataField: "rejectedRequests",
        status: ["rejected"],
        color: "#E91404"
    }];

    const COLORS = ['#EA1FE3', '#FFBB28', '#0088FE', '#2596BE', 'orange', '#00C49F'];
    let graphCount = [];

    if (tableData) {
        graphCount = [{
            count: tableData.createdRequests,
            label: "Created",
            status: ["created"]
        }, {
            count: tableData.approvedRequests,
            label: "Approved",
            status: ["approved"]
        }, {
            count: tableData.inProgressRequests,
            label: "In Progress",
            status: ["in_progress"]
        }, {
            count: tableData.deployedRequests,
            label: "Deployed",
            status: ["deployed"]
        }, {
            count: tableData.smokeTestedRequests,
            label: "Smoke Tested",
            status: ["smoke_tested"]
        }, {
            count: tableData.rejectedRequests,
            label: "Rejected",
            status: ["rejected"]
        }];
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active) {
            let percent = tableData && ((payload[0].value * 100) / tableData['totalRequests']).toFixed(2);
            return (
                <div style={{ backgroundColor: '#ffffff', width: '120px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p className='pt-2'>{`${payload[0].name}: ${percent}%`}</p>
                </div>
            );
        }
        return null;
    };

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
        cx, cy, midAngle, innerRadius, outerRadius, percent, index,
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <>
            <h6 style={titleStyle} className="text-center">
                <strong>Status based view</strong>
            </h6>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <ResponsiveContainer height={250}>
                    <PieChart>
                        <Pie
                            data={graphCount}
                            isAnimationActive={false}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            innerRadius={20}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="label"
                        >
                            {
                                graphCount.map((entry, index) =>
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}
                                    />)
                            }
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={0} />
                    </PieChart>
                </ResponsiveContainer>

                <Table bordered size="sm">
                    <tbody>
                        {columns.map((col, idx) => {
                            const searchCriterias = {
                                status: col.status,
                                createdAt: `${startDate} to ${endDate}`
                            };

                            if (loanVendor && loanVendor !== "all") {
                                searchCriterias["loanVendor"] = loanVendor;
                            }
                            const eSearchCriterias = encodeURIComponent(JSON.stringify(searchCriterias));
                            return (
                                <tr key={idx}>
                                    <th>{col && col.text}</th>
                                    <td >
                                        <Link style={{ color: col.color }} to={`/analytics/devops-infra-requests?searchCriterias=${eSearchCriterias}`}>
                                            {tableData && tableData[col.dataField]}
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        </>
    )
}

export default Overview;