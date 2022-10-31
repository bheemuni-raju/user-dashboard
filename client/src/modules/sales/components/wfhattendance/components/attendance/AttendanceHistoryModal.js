import React from "react";
import moment from 'moment';
import { Button, Row, Col, Table } from "reactstrap";

import ModalWindow from "components/modalWindow";
import { BoxBody } from "components/box";
import { Divider } from "antd";

class AttendanceHistoryModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: true,
    };
  }

  onClickClose = () => {
    this.props.onClose(false);
  };

  getTableRows =()=>{
    const {rowData} = this.props;
    if(!rowData) return;
    const workflowHistory = rowData.workflowHistory || [];

    return workflowHistory.map((row, index)=>{
      return <tr>
        <td> {row.workflowStatus} </td>
        <td> {row.attendanceStatus} </td>
        <td> {row.updatedByRole} </td>
        <td> {row.updatedByEmail} </td>
        <td> {moment(new Date(row.updatedAt)).format('DD-MM-YYYY HH:mm:ss')} </td>
      </tr>
    });
  }

  render() {
    const { showModal } = this.state;
    const { closeModal} = this.props;
    
    return (
      <ModalWindow
        showModal={showModal}
        heading={"Workflow History"}
        closeModal={closeModal}
        size={"lg"}
      >
    
        <Table>
          <thead>
          <tr>
            <th>Workflow Status</th>
            <th>Attendance Status</th>
            <th>Updated By Role</th>
            <th>Updated By</th>
            <th>Updated At</th>
          </tr>
          </thead>
          <tbody>
          {this.getTableRows()}
          </tbody>
        </Table>

        <Divider />
        <BoxBody>
          <Row>
            <Col md={12}>
              <div className="text-right">
                <Button color="danger" onClick={this.onClickClose}>
                  Close
                </Button>
              </div>
            </Col>
          </Row>
        </BoxBody>
      </ModalWindow>
    );
  }
}

export default AttendanceHistoryModal;
