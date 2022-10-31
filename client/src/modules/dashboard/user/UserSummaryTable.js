import React from 'react';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import moment from 'moment';

const UserSummaryTable = (props) => {
    const { start, end } = props.dateRange || {}
    const startDate = moment(start).format('YYYY-MM-DD');
    const endDate = moment(end).format('YYYY-MM-DD');

    const userTableData = props.userTableData && props.userTableData[0];

    const userColumns = [{
        text: 'Total',
        dataField: "totalUsers",
        appName: "all"
    }, {
        text: 'UMS',
        dataField: "umsUsers",
        appName: "ums"
    }, {
        text: 'IMS',
        dataField: "imsUsers",
        appName: "ims"
    }, {
        text: 'FMS',
        dataField: "fmsUsers",
        appName: "fms"
    }, {
        text: 'POMS',
        dataField: "pomsUsers",
        appName: "poms"
    }, {
        text: 'LMS',
        dataField: "lmsUsers",
        appName: "lms"
    }, {
        text: 'SOS',
        dataField: "sosUsers",
        appName: "sos"
    }, {
        text: 'OMS',
        dataField: "omsUsers",
        appName: "oms"
    }, {
        text: 'CXMS',
        dataField: "cxmsUsers",
        appName: "cxms"
    },{
        text: 'DFOS',
        dataField: "dfosUsers",
        appName: "dfos"
    }];

    return (
        <>
            <Table>
                <tr>
                    <td>
                        <thead>
                            <tr>
                                {userColumns.map((col, idx) => {
                                    return (
                                        <th key={idx}>{col.text}</th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {userColumns.map((col, idx) => {
                                    const searchCriterias = {
                                        status: "active",
                                        "actionDetails.createdAt": `${startDate} to ${endDate}`
                                    };
                                    let appName = get(col, "appName");
                                    if (appName && appName !== "all") {
                                        searchCriterias["appName"] = appName
                                    }
                                    const eSearchCriterias = encodeURIComponent(JSON.stringify(searchCriterias));
                                    return (
                                        <td key={idx}>
                                            <Link style={{ color: '#ea1fe3' }} to={`/analytics/application-users?searchCriterias=${eSearchCriterias}`}>
                                                {userTableData && userTableData[col.dataField]}
                                            </Link>
                                        </td>
                                    )
                                })}
                            </tr>
                        </tbody>
                    </td>
                </tr>
            </Table>
        </>
    )
}

export default UserSummaryTable;