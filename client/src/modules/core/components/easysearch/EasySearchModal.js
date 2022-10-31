import React, { useState } from 'react';
import {
    Modal, ModalHeader, ModalBody, Row, Col,
    FormGroup, Label, Input, ModalFooter, Button
} from 'reactstrap';
import DateRangePicker from 'react-datepicker/dist/react-datepicker'
//import DateRangePicker from 'react-bootstrap-daterangepicker';

import './EasySearchModal.css';

export default function EasySearchModal(props) {
    const { columns } = props;
    const [formValues, setFormValues] = useState({});

    function onChangeText(e) {
        const { name, value } = e.target;

        setFormValues({
            ...formValues,
            [name]: value
        });
    }

    function onChangeNumber(e) {
        const { name, value } = e.target;

        setFormValues({
            ...formValues,
            [name]: value
        });
    }

    function onChangeDrpCallback(start, end, label, dataField) {
        const startKey = `${dataField}_start`;
        const endKey = `${dataField}_end`;

        setFormValues({
            ...formValues,
            [startKey]: start.format('YYYY-MM-DD'),
            [endKey]: end.format('YYYY-MM-DD')
        });
    }

    function onClickSearch() {
        console.log(formValues);
    }

    function onClickCancel() {
        props.hideModal();
    }

    function buildInputSection({ type, dataField = "text" }) {
        let dom;

        if (type === "text") {
            dom = (
                <Col lg={8}>
                    <Input type="text" name={dataField} onChange={onChangeText} />
                </Col>
            )
        }
        else if (type === "number" || dataField.includes("Amount")) {
            dom = (
                <Col lg={8}>
                    <Row>
                        <Col lg={6} className="range-dash" >
                            <Input type="number"
                                name={`${dataField}_start`}
                                onChange={onChangeNumber}
                            />
                        </Col>
                        <Col lg={6}>
                            <Input type="number"
                                name={`${dataField}_end`}
                                onChange={onChangeNumber}
                            />
                        </Col>
                    </Row>
                </Col>
            )
        }
        else if (type === "date" || dataField.includes("At")) {
            dom = (
                <Col lg={8}>
                    <DateRangePicker
                        onCallback={(start, end, label) => onChangeDrpCallback(start, end, label, dataField)}>
                        <input type="text" className="form-control" name={dataField} />
                    </DateRangePicker>
                </Col>
            )
        }
        else {
            dom = (
                <Col lg={8}>
                    <Input type={'text'} name={dataField} onChange={onChangeText} />
                </Col>
            )
        }

        return dom;
    }

    return (
        <Modal
            size="lg"
            isOpen={true}
            keyboard={true}
            toggle={props.hideModal}
            backdrop={true}
            fade={true}
        >
            <ModalHeader
                toggle={props.hideModal}
                className="modal-colored-header bg-primary">
                Easy Search
            </ModalHeader>
            <ModalBody>
                <Row>
                    {columns.map((col, idx) => (
                        <Col lg={6} key={idx}>
                            <FormGroup row>
                                <Label for={col.dataField} lg={4} className="text-right">
                                    {col.text}
                                </Label>
                                {buildInputSection(col)}
                            </FormGroup>
                        </Col>
                    ))}
                </Row>
            </ModalBody>
            <ModalFooter className="justify-content-center">
                <Button color="primary" onClick={onClickSearch}>Search</Button>
                <Button color="secondary" onClick={onClickCancel}>Cancel</Button>
            </ModalFooter>
        </Modal>
    )
}