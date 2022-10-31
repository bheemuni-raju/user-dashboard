import React from 'react';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import moment from 'moment';

const RoleSummaryTable = (props) => {
    const { start, end } = props.dateRange || {}
    const startDate = moment(start).format('YYYY-MM-DD');
    const endDate = moment(end).format('YYYY-MM-DD');

    const roleTableData = props.roleTableData && props.roleTableData[0];

    const roleColumns = [{
        text: 'Total',
        dataField: "totalRoles",
        appName: "all"
    }, {
        text: 'UMS',
        dataField: "umsRoles",
        appName: "ums"
    }, {
        text: 'IMS',
        dataField: "imsRoles",
        appName: "ims"
    }, {
        text: 'FMS',
        dataField: "fmsRoles",
        appName: "fms"
    }, {
        text: 'POMS',
        dataField: "pomsRoles",
        appName: "poms"
    }, {
        text: 'LMS',
        dataField: "lmsRoles",
        appName: "lms"
    }, {
        text: 'SOS',
        dataField: "sosRoles",
        appName: "sos"
    }, {
        text: 'OMS',
        dataField: "omsRoles",
        appName: "oms"
    }, {
        text: 'CXMS',
        dataField: "cxmsRoles",
        appName: "cxms"
    }, {
        text: 'MOS',
        dataField: "mosRoles",
        appName: "mos"
    },{
        text: 'DFOS',
        dataField: "dfosRoles",
        appName: "dfos"
    }];

    return (
        <>
            <Table>
                <tr>
                    <td>
                        <thead>
                            <tr>
                                {roleColumns.map((col, idx) => {
                                    return (
                                        <th key={idx}>{col.text}</th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {roleColumns.map((col, idx) => {
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
                                            <Link style={{ color: '#ea1fe3' }} to={`/analytics/application-roles?searchCriterias=${eSearchCriterias}`}>
                                                {roleTableData && roleTableData[col.dataField]}
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

export default RoleSummaryTable;