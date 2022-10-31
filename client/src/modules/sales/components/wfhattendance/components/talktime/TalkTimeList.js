import React, { useState } from 'react';
import moment from 'moment';
import { Row, Col ,Button } from "reactstrap";

import { BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

import TalkTimeMapModal from './TalkTimeMapModal';

const WfhTalkTimeList = (props) => {
    let serachFormRef = "";
    let [byjusGridRef, setByjusGridRef] = useState("");
    const currentDate = moment().format('YYYY-MM-DD');
    const baseUrl = `/usermanagement/wfhtalktime/list`;
    const { source } = props;
    const [showActionModal, setShowActionModal] = useState(false);
    const [rowData, setRowData] = useState({});
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [gridDataUrl, setGridDataUrl] = useState(`${baseUrl}/?date=${selectedDate}&source=${source}`);

    const showModal = (show,rowData) => {
        setShowActionModal(show);
        setRowData(rowData);
    }

    const getColumns = () => {
        const columns = [{
            dataField: 'phone',
            text: 'Action',
            width: '120px',
            formatter: (cell, row) => {
                return (
                    <div>
                        <Row>
                        <Col className="col-5">
                        <Button type="primary" size="small" disabled={row.isMapped} className="mr-1" onClick={() => showModal(true,row)}>
                            <i className="fa fa-pencil" />
                        </Button>
                        </Col>
                        </Row>
                    </div>
                );
            }
        },{
            dataField: 'date',
            text: 'Attendance Date'
        }, {
            dataField: "email",
            text: "Employee Email",
            width: '250px',
            quickFilter: true
        },{
            dataField: "phone",
            text: "Employee Phone",
            width: '250px',
            quickFilter: true
        }, {
            dataField: "tnlId",
            text: "Employee Tnl",
            quickFilter: true
        }, {
            dataField: 'name',
            text: 'Employee Name',
            quickFilter: true
        }, {
            dataField: 'talktime',
            text: 'Talktime'
        }, {
            dataField: 'connectedCalls',
            text: 'Connected Calls'
        }];

        if(source.length > 1){
           columns.push({
            dataField: "source",
            text: "Source",
            width: '150px',
            quickFilter: true
        }) 
        }

        return columns;
    }

    const getPills = () => {
        const previousDate = moment(selectedDate).format('YYYY-MM-DD');

        return [{
            title: 'All',
            contextCriterias: []
        }, {
            title: 'Mapped',
            contextCriterias: [{
                selectedColumn: 'isMapped',
                selectedOperator: 'in',
                selectedValue: [true]
            }, {
                selectedColumn: 'date',
                selectedOperator: 'in',
                selectedValue: [previousDate]
            }]
        }, {
            title: 'Not Mapped',
            contextCriterias: [{
                selectedColumn: 'isMapped',
                selectedOperator: 'in',
                selectedValue: [false, null]
            }, {
                selectedColumn: 'date',
                selectedOperator: 'in',
                selectedValue: [previousDate]
            }]
        }];
    }

    const onClickSearch = () => {
        setGridDataUrl(`${baseUrl}/?date=${selectedDate}&source=${source}`);
    }

    const onChangeDate = (value, name) => {
        setSelectedDate(value);
    }

    const getSearchFields = () => {
        return [{
            type: 'date',
            name: 'selectedDate',
            value: selectedDate,
            onChange: onChangeDate
        }, {
            type: 'button',
            text: 'Search',
            onClick: onClickSearch
        }];
    }

    const handleFromSubmit = (formData) => {
        callApi(`/usermanagement/wfhtalktime/mapTalktime`, 'PUT', formData, null, null, true)
            .then((response) => {
                showModal(false);
                byjusGridRef && byjusGridRef.onClickRefresh();
            })
            .catch(error => {
                console.log(error);
            })
    }

    const columns = getColumns();
    const pills = getPills();
    const fields = getSearchFields();

    return (
        <BoxBody>
            <FormBuilder
                ref={(element) => serachFormRef = element}
                fields={fields}
                initialValues={{
                    selectedDate
                }}
                cols={4}
            />
            <ByjusGrid
                ref={element => setByjusGridRef(element)}
                gridDataUrl={gridDataUrl}
                columns={columns}
                pillOptions={{
                    pills
                }}
                sort={{ emailId: 1 }}
            />

            { showActionModal && (
                <TalkTimeMapModal
                onSave={handleFromSubmit}
                onClose={showModal}
                rowData={rowData}
              />
            )}
        </BoxBody>
    )
}

export default WfhTalkTimeList;
