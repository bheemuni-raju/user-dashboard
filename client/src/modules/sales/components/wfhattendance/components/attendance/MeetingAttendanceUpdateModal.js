import React from "react";
import { Button, Row, Col, Table } from "reactstrap";

import ModalWindow from "components/modalWindow";
import { FormBuilder } from "components/form";
import { BoxBody } from "components/box";
import { Divider } from "antd";

class MeetingAttendanceUpdateModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      showModal: true,
      formValues: {
        meetingAttendanceStatus: ""
      },
      initialValues: {
        meetingAttendanceStatus:"meeting_attendance_marking_open"
      }
    };
  }

  onClickClose = () => {
    this.props.onClose(false);
  };


  handleFormSubmit = () => {
    const editMeetingAttendenceStatusForm = this.refs.editMeetingAttendenceStatusForm;
    let formValues = editMeetingAttendenceStatusForm.validateFormAndGetValues();
    this.props.onSave(formValues)
  };

  getFields = () => {
    let fields = [
      {
        name: "meetingAttendanceStatus",
        type: "select",
        label: "Meeting Attendance Status",
        options: [
            {label:"Open For Marking" , value:"meeting_attendance_marking_open"},
            {label:"Attended" , value:"attended"},
            {label:"Not Attended" , value:"not_attended"},
            {label:"Not Marked" , value:"not_marked"}
        ]
      }
    ];
    return fields;
  };

  getTableRows =()=>{
    const {selectedRows} = this.props;
    if(!selectedRows) return;
    return selectedRows.map((row, index)=>{
      return <tr>
        <td> {row.date} </td>
        <td> {row.emailId} </td>
        <td> {row.meetingAttendanceStatus} </td>
      </tr>
    });
  }

  render() {
    const { loading, showModal, initialValues, error } = this.state;
    const { closeModal, selectedRows } = this.props;
    
    return (
      <ModalWindow
        loading={loading}
        showModal={showModal}
        heading={"Update Meeting Attendance Status"}
        closeModal={closeModal}
        size={"lg"}
      >
        <Table>
          <thead>
          <tr>
            <th>Date</th>
            <th>Email</th>
            <th>Meeting Attendance Status</th>
          </tr>
          </thead>
          <tbody>
          {this.getTableRows()}
          </tbody>
        </Table>
        <Divider />
        <FormBuilder
          ref="editMeetingAttendenceStatusForm"
          fields={this.getFields()}
          cols={1}
          initialValues={initialValues}
        />
        <Divider />
        <BoxBody loading={loading}>
          <Row>
            <Col md={12}>
              <div className="text-right">
                <Button color="success" onClick={this.handleFormSubmit}>
                  Submit
                </Button>{" "}
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

export default MeetingAttendanceUpdateModal;
