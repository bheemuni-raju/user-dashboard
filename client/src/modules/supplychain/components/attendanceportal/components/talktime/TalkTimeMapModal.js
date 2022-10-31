import React from "react";
import { Button, Row, Col } from "reactstrap";
import { Divider } from "antd";

import ModalWindow from "components/modalWindow";
import { FormBuilder } from "components/form";
import { BoxBody } from "components/box";

class TalkTimeMapModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      showModal: true,
      formValues: {
        date: "",
        phone: "",
        talktime:-1,
        source:"",
        email:"",
        connectedCalls:-1
      },
      initialValues: {
        date: props.rowData.date,
        phone: props.rowData.phone,
        talktime:props.rowData.talktime,
        source:props.rowData.source,
        email:props.rowData.email,
        connectedCalls: props.rowData.connectedCalls
      }
    };
  }

  onClickClose = () => {
    this.props.onClose(false);
  };


  handleFormSubmit = () => {
    const mapTalktimeForm = this.refs.mapTalktimeForm;
    let formValues = mapTalktimeForm.validateFormAndGetValues();
    this.props.onSave(formValues)
  };

  getFields = () => {
      let { rowData} = this.props;
    let fields = [
      {
        name: "date",
        type: "readonly",
        required: true,
        label: "Date"
      },
      {
        name: "phone",
        type: "readonly",
        required: rowData.source==="ameyo_ivr",
        label: "Phone"
      },
      {
        name: "talktime",
        type: "readonly",
        required: true,
        label: "Talktime"
      },
      {
          name : "connectedCalls",
          type: "readonly",
          label: "Connected Calls",
          required :true
      },
      {
        name: "source",
        type: "readonly",
        required: true,
        label: "Source"
      },
      {
        name: "email",
        type: rowData.source==="ameyo_ivr" ? "text" :"readonly",
        required: true,
        label: "Email"
      }
    ];
    return fields;
  };

  render() {
    const { loading, showModal, initialValues, error } = this.state;
    const { closeModal, rowData } = this.props;
    
    return (
      <ModalWindow
        loading={loading}
        showModal={showModal}
        heading={"Map Talktime To Attendance"}
        closeModal={closeModal}
        size={"md"}
      >
        <FormBuilder
          ref="mapTalktimeForm"
          fields={this.getFields()}
          cols={2}
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

export default TalkTimeMapModal;
