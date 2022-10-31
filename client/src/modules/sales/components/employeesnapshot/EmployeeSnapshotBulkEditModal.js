import React from 'react';
import { uniq } from 'lodash';
import { Button, Row, Col, Alert, Label, Input } from 'reactstrap';
import { connect } from 'react-redux';
import Notify from 'react-s-alert';
import Axios from 'axios';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { BoxBody } from 'components/box';
import Confirm from 'components/confirm';

class EmployeeSnapshotBulkEditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      showModal: true,
      isCheckboxSelected:false
    };
  }

  updateList = [
    {
      label: 'Campaign',
      value: 'campaign'
    },
    {
      label: 'Location',
      value: 'location'
    },
    {
      label: 'Reporting Manager Email',
      value: 'reporting_manager_email'
    },
    {
      label: 'Role',
      value: 'role'
    },
    {
      label: 'Status',
      value: 'status'
    },
    {
      label: 'Unit',
      value: 'unit'
    },
    {
      label: 'Vertical',
      value: 'vertical'
    }];

  getFields = () => {
    const fields = [
      {
        name:"field",
        type: 'select',
        label: 'Select field to update',
        options: this.updateList, 
        onChange : (value) => {
            this.setState({selectedField:value})
        },
        required: true
      }
    ];

    switch(this.state.selectedField){
      case 'vertical' :
        fields.push({
            type: "select",
            label: "Vertical",
            name: "vertical",
            model: "Vertical",
            displayKey: "name",
            valueKey: "name",
            filter: { departmentFormattedName: "business_development" },
            required: true
        });    
        break;  
      case 'role' :
        fields.push({
            type: "select",
            label: "Role",
            name: "role",
            options: this.props.roleOptions,
            required: true
        }); 
        break;
      case 'unit' :
        fields.push({
            name: "unit",
            type: "select",
            label: "Unit",
            model: "Unit",
            displayKey: "name",
            valueKey: "name",
            filter: { departmentFormattedName: "business_development", subDepartmentFormattedName: "sales" },
            required: true
        });
        break;
      case 'reporting_manager_email' :
        fields.push({
            type: "text",
            label: "Reporting Manager Email",
            name: "reporting_manager_email",
            placeholder: "Reporting Manager Email",
            required: true
        });
        break;
      case 'status' :
        fields.push({
            type: "select",
            label: "Status",
            name: "status",
            options: [
            { label: 'Active', value: 'active' },
            { label: 'Left', value: 'left' },
            { label: 'Campaign training', value: 'campaign_training' }
          ],
            required: true
        });
        break;
      case 'campaign' :
        fields.push({
            type: "select",
            label: "Campaign",
            name: "campaign",
            model: "Campaign",
            displayKey: "name",
            valueKey: "formattedName",
            filter: { departmentFormattedName: "business_development", subDepartmentFormattedName: "sales"  },
            required: true
        });
        break;
      case 'location' :
        fields.push({
          type: "text",
          label: "Location",
          name: "location",
          placeholder: "Location",
          required: true
        });
      break;
  }
      fields.push({
        name: 'reason',
        type: 'textarea',
        label: 'Reason',
        placeholder : "Enter the reason",
        required: true,
      })
    return fields;
  };

  onClickSave = async () => {
    const { selectedEmployees, cycleFilters } = this.props;
    const employeeEmails = selectedEmployees.map(ele => ele.employee_email);
    const uniqueEmailsLists = uniq(employeeEmails)
    const bulkUpdateEmployeeForm = this.refs.editBulkUpdateEmployeeForm;
    let formValues = bulkUpdateEmployeeForm.validateFormAndGetValues();
    formValues.isChecked = this.state.isCheckboxSelected;

    if (formValues) {
        formValues['employeeEmails'] = uniqueEmailsLists;
      try {
        this.setState({ loading: true });
        const response =  await Axios({
            url: `${window.NAPI_URL}/usermanagement/employeesnapshot/bulkUpdateEmployeeSnapshot?cycle_name=${cycleFilters}`,
            method: 'post',
            data: formValues
          });
        this.setState({ showModal:false});
        Notify.success(response.data.message);
        this.props.refreshGrid();
        this.props.closeModal();
      } catch (err) {
        this.setState({ loading: false, error: err });
        Notify.error(' Order update failed, please retry.');
      }
    }
  };

  onClickClose = () => {
    this.props.closeModal();
  };

  onClickNotify = async () => {
    let result = await Confirm();
    if (result) {
        this.onClickSave();
    }
  }
  
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
    const { loading, showModal, selectedField } = this.state;
    const { closeModal, latestGeneratedCycle } = this.props;

    return (
      <ModalWindow
        showModal={showModal}
        heading={'Bulk Update Employee Data'}
        closeModal={closeModal}
      >
        <BoxBody loading={loading}>  
          <Row>
            <Col md={12}>
              <FormBuilder
                ref="editBulkUpdateEmployeeForm"
                fields={this.getFields()}
                cols={2}
              />
              <div className="text-right">
                {/* {latestGeneratedCycle && 
                  (<div className="text-left">
                    {selectedField !== "reporting_manager_email" && <Label>
                      <Input type="checkbox" onClick={(e) => this.getCheckboxValue(e)}/> Also change in the latest employee mapping
                    </Label>}
                    <Alert color="info" className="float-left">
                      <i className="fa fa-info-circle" style={{marginRight: "2px"}}><b> Note : </b></i>
                        Changes to "Reporting Manager" will not be reflected in the latest mapping.
                        Please go to "MANAGE EMPLOYEES" for the same.
                    </Alert>
                  </div>
                )} */}
        
                <Button color="success" onClick={this.onClickNotify} >
                  Save
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

export default connect(mapStateToProps)(EmployeeSnapshotBulkEditModal);
