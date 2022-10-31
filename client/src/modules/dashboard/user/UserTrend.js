import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const UserTrend = (props) => {
    const { userGraphData } = props;

    return (
        <>
            {userGraphData &&
                <ResponsiveContainer height={300}>
                    <ComposedChart
                        data={userGraphData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area dataKey="totalUsers" name="Total" fill="#8884d8" />
                        <Line type="monotone" dataKey="umsUsers" name="UMS" stroke="#0000ff" />
                        <Line type="monotone" dataKey="imsUsers" name="IMS" stroke="#44d8aa" />
                        <Line type="monotone" dataKey="fmsUsers" name="FMS" stroke="#04d5ca" />
                        <Line type="monotone" dataKey="pomsUsers" name="POMS" stroke="#f4db8a" />
                        <Line type="monotone" dataKey="lmsUsers" name="LMS" stroke="#c8c85c" />
                        <Line type="monotone" dataKey="sosUsers" name="SOS" stroke="#f8885c" />
                        <Line type="monotone" dataKey="omsUsers" name="OMS" stroke="#c0006c" />
                        <Line type="monotone" dataKey="cxmsUsers" name="CXMS" stroke="#c4d44a" />
                    </ComposedChart>
                </ResponsiveContainer>
            }
        </>
    );
}

export default UserTrend;