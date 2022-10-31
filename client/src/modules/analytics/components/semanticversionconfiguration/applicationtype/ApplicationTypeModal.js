import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { get, isEmpty } from "lodash";
import ModalWindow from "components/modalWindow";
import { FormBuilder } from "components/form";
import { callApi } from "store/middleware/api";

class ApplicationTypeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      data: null,
    };
  }

  handleOnChange = (selectedValue, name) => {
    this.setState({ [name]: selectedValue });
  };

  validateWhiteSpace = (formValues = {}) => {
    let { name, formattedName} = formValues;
    let whiteSpaceRegex = new RegExp(/^\s+$/);
    let validationErrors = {};

    if (whiteSpaceRegex.test(name)) {
        validationErrors["name"] = `Enter valid Application Type`
    }
     if (whiteSpaceRegex.test(formattedName)) {
      validationErrors["formattedName"] = `Enter valid Formated Name`
  }
    return validationErrors;
}

  buildForm = (data) => {
    const fields = [
      {
        type: "text",
        name: "name",
        label: "Application Type",
        required: true,
      },
      {
        type: "text",
        name: "formattedName",
        label: "Formatted Name",
        required: true,
      },
    ];

    const initialValues = !isEmpty(data) ? data : {};

    return (
      <>
        <FormBuilder
          ref="applicationTypeForm"
          validateValues={this.validateWhiteSpace}
          fields={fields}
          initialValues={initialValues}
          cols={1}
        />
        <div className="text-right">
          <Button type="button" color="success" onClick={this.onClickSave}>
            Save
          </Button>
          {"   "}
          <Button type="button" color="danger" onClick={this.props.closeModal}>
            Cancel
          </Button>
        </div>
      </>
    );
  };

  onClickSave = () => {
    const { data } = this.state;
    const applicationTypeForm = this.refs.applicationTypeForm;
    const formValues = applicationTypeForm
      ? applicationTypeForm.validateFormAndGetValues()
      : null;
    if (formValues) {
      this.setState({ loading: true });
      const type = data ? "edit" : "add";
      const url =
        type == "add"
          ? `/usermanagement/semantic/applicationtype/create`
          : `/usermanagement/semantic/applicationtype/create/${data.id}`;
      const method = type == "add" ? "POST" : "PUT";

      const body = {
        ...formValues
      };

      try {
        const userKey = type == "add" ? "createdBy" : "updatedBy";
        body[userKey] = get(this.props.user, "email", "");
        callApi(url, method, body, null, null, true)
          .then((response) => {
            this.props.refreshGrid();
            this.props.closeModal();
          })
          .catch((error) => {
            this.setState({ loading: false, error });
          });
      } catch (error) {
        this.setState({ loading: false, error });
      }
    }
  };

  componentWillMount = () => {
    const { data } = this.props;
    if (data) this.setState({ data });
  };

  render() {
    const { showModal, data, loading, error } = this.state;
    return (
      <ModalWindow
        loading={loading}
        error={error}
        showModal={showModal}
        closeModal={this.props.closeModal}
        heading={`${data ? "Edit" : "Create"} Application Type`}
      >
        {this.buildForm(data)}
      </ModalWindow>
    );
  }
}

const mapStateToProps = (state) => ({
  user: get(state, "auth.user"),
});

export default connect(mapStateToProps)(ApplicationTypeModal);
