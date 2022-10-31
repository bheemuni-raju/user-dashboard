import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const RoleTrend = (props) => {
    const { roleGraphData } = props;

    return (
        <>
            {roleGraphData &&
                <ResponsiveContainer height={300}>
                    <ComposedChart
                        data={roleGraphData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area dataKey="totalRoles" name="TOTAL" fill="#8884d8" />
                        <Line type="monotone" dataKey="umsRoles" name="UMS" stroke="#0000ff" />
                        <Line type="monotone" dataKey="imsRoles" name="IMS" stroke="#44d8aa" />
                        <Line type="monotone" dataKey="fmsRoles" name="FMS" stroke="#04d5ca" />
                        <Line type="monotone" dataKey="pomsRoles" name="POMS" stroke="#f4db8a" />
                        <Line type="monotone" dataKey="lmsRoles" name="LMS" stroke="#c8c85c" />
                        <Line type="monotone" dataKey="sosRoles" name="SOS" stroke="#f8885c" />
                        <Line type="monotone" dataKey="omsRoles" name="SOS" stroke="#c0006c" />
                        <Line type="monotone" dataKey="cxmsRoles" name="CXMS" stroke="#c4d44a" />
                        <Line type="monotone" dataKey="mosRoles" name="MOS" stroke="#f8885c" />
                    </ComposedChart>
                </ResponsiveContainer>
            }
        </>
    );
}

export default RoleTrend;