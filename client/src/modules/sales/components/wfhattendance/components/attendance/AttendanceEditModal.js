import React from "react";
import { Button, Row, Col } from "reactstrap";

import ModalWindow from "components/modalWindow";
import { FormBuilder } from "components/form";
import { BoxBody } from "components/box";
import ErrorWrapper from 'components/error/ErrorWrapper';

class AttendanceEditModal extends React.Component {
  constructor(props) {
    super(props);
    
    const {workflowStatus, emailId, date, meetingAttendanceStatus, talktime, connectedCalls, finalAttendance, reportingManagerEmailId} = props.rowData;
    
    this.state = {
      loading: false,
      showModal: true,
      formValues: {
        workflowStatus: "",
        emailId: "",
        date:"",
        meetingAttendanceStatus:"",
        talktime:0,
        connectedCalls:0,
        finalAttendance:""
      },
      initialValues: {
        workflowStatus,
        emailId,
        date,
        meetingAttendanceStatus,
        talktime,
        connectedCalls,
        finalAttendance,
        reportingManagerEmailId
      }
    };
  }

  onClickClose = () => {
    this.props.onClose();
  };


  handleFormSubmit = () => {
    const editAttendenceForm = this.refs.editAttendenceForm;
    let formValues = editAttendenceForm.validateFormAndGetValues();
    this.props.onSave(formValues)
  };

  getFields = () => {
    let fields = [
      {
        name: "emailId",
        type: "readonly",
        required: true,
        label: "Employee Email"
      },
      {
        name: "date",
        type: "readonly",
        required: true,
        label: "Date"
      },
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
      },
      {
        name: "talktime",
        type: "number",
        label: "TalkTime"
      },
      {
        name: "connectedCalls",
        type: "number",
        label: "Connected Calls"
      },
      {
        name: "reportingManagerEmailId",
        type: "text",
        label: "Reporting Manager Email"
      },
      {
        name: "workflowStatus",
        type: "select",
        label: "Workflow Status",
        options: [
            {label:"Request Raised" , value:"request_raised"},
            {label:"Approved" , value:"approved"},
            {label:"Rejected" , value:"rejected"}
        ]
      },
      {
        name: "finalAttendance",
        type: "select",
        label: "Final Attendance",
        options: [
            {label:"Present" , value:"present"},
            {label:"Absent" , value:"absent"}
        ]
      }
    ];
    return fields;
  };

  render() {
    const { loading, showModal, initialValues } = this.state;
    const { closeModal, rowData , error } = this.props;
    
    return (
      <ModalWindow
        loading={loading}
        showModal={showModal}
        heading={"Update Attendence Info"}
        closeModal={closeModal}
        size={"lg"}
      >
        <ErrorWrapper error={error} errorTop={true}>
        <FormBuilder
          ref="editAttendenceForm"
          fields={this.getFields()}
          cols={3}
          initialValues={initialValues}
        />
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
        </ErrorWrapper>
      </ModalWindow>
    );
  }
}

export default AttendanceEditModal;
