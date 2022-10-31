import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { useLocation, useParams, Link } from 'react-router-dom';
import { get } from 'lodash';

import { BoxBody, Box } from 'components/box';
import EmployeeSplitDashboard from './EmployeeSplitDashboard';
import SplitViewContainer from 'modules/core/components/grid/SplitViewContainer';

const EmployeeList = (props) => {

    const [hideList, setHideList] = useState(false)
    const baseUrl = `/usermanagement/wfhattendance/employeelist`;
    const [selectedEmail, setSelectedEmail] = useState("");
    const [gridDataUrl, setGridDataUrl] = useState(baseUrl);
    const { pathname } = useLocation();
    const gridRef = useRef();
    const { email } = useParams();

    const condensed = email;
    useEffect(() => {
        !condensed && setHideList(false)
    }, [condensed])

    const refreshGrid = () => {
        gridRef.current && gridRef.current.refreshGrid();
    }

    const onClickSearch = () => {
        setGridDataUrl(`${baseUrl}/?email=${selectedEmail}`);
    }

    const condensedColumns = [{
        dataField: 'email',
        text: 'Employee Email',
        type: 'string',
        columnClassName: (col) => col === selectedId ? "bg-highlight" : "",
        quickFilter: true,
        formatter: (cell, row) => {
            const email = get(row, 'email', 'N/A')
            const tnlId = get(row, 'tnlId', 'N/A')
            const role = get(row, 'role', 'N/A')
            return (
                <Link to={`${email}`}>
                    <div className="d-flex justify-content-between">
                        <div className="text-truncate text-startcase text-dark">{email}</div>
                    </div>
                    <div className="d-flex justify-content-between">
                        <div className="subtitle-orderid">
                            <small className="font-weight-bold">#{tnlId}</small><br />
                        </div>
                        <div className="font-weight-bold">{role}</div>
                    </div>
                </Link>
            )
        }
    }]

    const columnFormatters = {
        linkFormatter: (cell, row) => {
            return (<Link to={`employee-list/${cell}`}>{cell}</Link>)
        },
        dateFormatter: (cell, row) => {
            return cell ? moment(cell).format("DD-MM-YYYY") : "";
        }
    }
    const selectedId = pathname.split("/")[3];

    return (
        <Box>
            <BoxBody>
                <SplitViewContainer
                        ref={gridRef}
                        gridId={`missing_attendance`}
                        modelName="WfhAttendance"
                        gridDataUrl={gridDataUrl}
                        formatters={columnFormatters}
                        addOnQfColumns={[
                            { text: 'TnlId', dataField: 'tnlId' },
                            { text: 'Role', dataField: 'role' },
                            { text: 'Vertical', dataField: 'vertical' },
                            { text: 'Doj', dataField: 'doj' },
                        ]}
                        condensed={condensed}
                        condensedColumns={condensedColumns}
                        bodyContainerClass={condensed ? "attendance-split-table custom-scrollbar" : ""}
                    >
                        <EmployeeSplitDashboard
                            refreshGrid={refreshGrid}
                            email={email}
                            resize={true}
                            maximized={false}
                        />

                    </SplitViewContainer>
            </BoxBody>
        </Box>
    );
}

export default EmployeeList;
