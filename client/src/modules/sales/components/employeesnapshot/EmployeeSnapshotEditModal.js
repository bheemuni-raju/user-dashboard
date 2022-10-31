import React from 'react';
import { get, toLower } from 'lodash';
import { Button, Row, Col, Alert, Label, Input } from 'reactstrap';
import { connect } from 'react-redux';
import Notify from 'react-s-alert';
import Axios from 'axios';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { Box, BoxHeader, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';

class EmployeeSnapshotEditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      showModal: true,
      isCheckboxSelected:false
    };
  }

  getFields = () => {
    return [
      {
        name: 'employee_email',
        type: 'text',
        label: 'Employee Email',
        disabled: true
      },
      {
        type: "select",
        label: "Role",
        name: "role",
        options: this.props.roleOptions,
        required: true
      },
      {
        name: "tnl_id",
        type: "text",
        label: "TNL ID",
        disabled: true
      },
      {
        type: "select",
        label: "Status",
        name: "status",
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Left', value: 'left' },
          { label: 'Campaign training', value: 'campaign_training' }
        ],
        required: true
      },
      {
        type: "select",
        label: "Vertical",
        name: "vertical",
        model: "Vertical",
        displayKey: "name",
        valueKey: "name",
        filter: { departmentFormattedName: "business_development", subDepartmentFormattedName: "sales"  },
        required: true
      },
      {
        type: "select",
        label: "Campaign",
        name: "campaign",
        model: "Campaign",
        displayKey: "name",
        valueKey: "formattedName",
        filter: { departmentFormattedName: "business_development", subDepartmentFormattedName: "sales"  },
        required: true
      },
      {
        type: "select",
        label: "Location",
        name: "location",
        model: "City",
        displayKey: "city",
        valueKey: "city",
        required: true
      },
      {
        name: "unit",
        type: "select",
        label: "Unit",
        model: "Unit",
        displayKey: "name",
        valueKey: "name",
        filter: { departmentFormattedName: "business_development", subDepartmentFormattedName: "sales" },
        required: true
      },
      {
        name: 'reporting_manager_email',
        type: 'text',
        label: 'Reporting Manager Email',
        required: true
      },
      {
        name: 'reporting_manager_role',
        type: 'select',
        label: 'Reporting Manager Role',
        options: this.props.roleOptions,
        required: true
      },
      {
        name: 'reason',
        type: 'textarea',
        label: 'Reason',
        placeholder : "Enter the reason",
        required: true,
      }
    ];
  };

  onClickSave = async () => {
    const { user, selectedEmployeeDetails } = this.props;
    
    const editEmployeeForm = this.refs.editEmployeeForm;
    let formValues = editEmployeeForm.validateFormAndGetValues();
    formValues.isChecked = this.state.isCheckboxSelected;

    if (formValues) {
      let result = await Confirm();
      if (result) {
      try {
        this.setState({ loading: true });
        await Axios({
          url: `${window.NAPI_URL}/usermanagement/employeesnapshot/updateEmployeeSnapshot?cycle_name=${selectedEmployeeDetails.cycle_name}`,
          method: 'post',
          data: formValues
        });
        this.setState({ showModal: false });

        Notify.success('Employee Snapshot updated successfully');
        this.props.refreshGrid();
        this.props.closeModal();
      } catch (err) {
        this.setState({ loading: false, error: err });
        Notify.error(' Order update failed, please retry.');
      }
    }
  }
  };

  onClickClose = () => {
    this.props.closeModal();
  };

  getCheckboxValue(event) {
    const value = event.target.checked;
    this.setState({isCheckboxSelected:value});
  }

  shouldComponentUpdate(prevState, nextState) {
    if(this.state.isCheckboxSelected !== nextState.isCheckboxSelected){
      return false;
    }
    return true;
  }

  render() {
    const { loading, showModal } = this.state;
    const { closeModal, selectedEmployeeDetails, latestGeneratedCycle } = this.props;

    const {
      employee_email = "",
      role = "", 
      tnl_id = "",
      status = "", 
      vertical = "",
      campaign = "",
      location = "",
      unit = "",
      reporting_manager_email = "",
      reporting_manager_role = "",
      reporting_manager_tnl_id = "" } = selectedEmployeeDetails;

    const initialValues = {
      employee_email: employee_email,
      role: role,
      tnl_id: tnl_id,
      status: toLower(status),
      vertical: vertical,
      campaign: campaign,
      location: location,
      unit: unit.replace(/ /g, ""),
      reporting_manager_email: reporting_manager_email,
      reporting_manager_role: reporting_manager_role,
      reporting_manager_tnl_id: reporting_manager_tnl_id
    };

    return (
      <ModalWindow
        showModal={showModal}
        heading={'Update Employee Snapshot'}
        closeModal={closeModal}
      >
        <BoxBody loading={loading}>
          <Row>
            <Col md={12}>
              <FormBuilder
                ref="editEmployeeForm"
                fields={this.getFields()}
                cols={3}
                initialValues={initialValues}
              />
              <div className="text-right">
              {/* {latestGeneratedCycle && 
                (<div className="text-left">
                  <Label>
                    <Input type="checkbox" onClick={(e) => this.getCheckboxValue(e)}/> Also change in the latest employee mapping
                  </Label>
                  <Alert color="info" className="float-left">
                    <i className="fa fa-info-circle" style={{marginRight: "3px"}}><b> Note : </b></i>
                      All updates except "Reporting Manager" will be reflected in the latest mapping.
                      For changing the latest "Reporting Manager" mapping, please go to "MANAGE EMPLOYEES".
                  </Alert>
                </div>
              )} */}

                <Button color="success" onClick={this.onClickSave} >
                  Update
                </Button>{' '}
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

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(EmployeeSnapshotEditModal);
