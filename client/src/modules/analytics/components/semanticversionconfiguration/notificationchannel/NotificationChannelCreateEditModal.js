import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";

import PropTypes from "prop-types";
import { get, isEmpty } from "lodash";

import ModalWindow from "../../../../../components/modalWindow";
import { FormBuilder } from "../../../../../components/form";
import { callApi } from "../../../../../store/middleware/api";

const NotificationChannelCreateEditModal = (props) => {
  // eslint-disable-next-line no-unused-vars
  const [toggleModal, setToggleModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data, user, actionType, refreshGrid, closeModal } = props;
  const refs = useRef();

  const validateWhiteSpace = (formValues = {}) => {
    let { name, formattedName} = formValues;
    let whiteSpaceRegex = new RegExp(/^\s+$/);
    let validationErrors = {};

    if (whiteSpaceRegex.test(name)) {
        validationErrors["name"] = `Enter valid Notification Channel`
    }
     if (whiteSpaceRegex.test(formattedName)) {
      validationErrors["formattedName"] = `Enter valid Formated Name`
  }
    return validationErrors;
}

  const buildForm = () => {
    const fields = [
      {
        type: "text",
        name: "name",
        label: "Notification Channel",
        required: true,
      },
      {
        type: "text",
        name: "formattedName",
        label: "Formatted Name",
        required: true,
      },
    ];
    const initialValues = actionType === "UPDATE" ? data : {};

    return (
      <>
        <FormBuilder ref={refs} fields={fields} initialValues={initialValues} validateValues={validateWhiteSpace}/>
      </>
    );
  };
  const onClickSave = async () => {
    const formValues =
      refs && refs.current && refs.current.validateFormAndGetValues();

    if (formValues) {
      setLoading(true);
      try {
        const body = {
          ...formValues,
        };
        const method = actionType === "UPDATE" ? "PUT" : "POST";
        const uri =
          actionType === "CREATE"
            ? `/usermanagement/semantic/notificationchannel/create`
            : `/usermanagement/semantic/notificationchannel/create/${data.id}`;
        const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";
        body[userKey] = get(user, "email", "");
        await callApi(uri, method, body, null, null, true)
          .then(() => {
            refreshGrid();
            closeModal("save");
          })
          .catch((err) => {
            setLoading(false);
            setError(err);
          });
      } catch (err) {
        setLoading(false);
        setError(err);
      }
    }
  };

  return (
    <ModalWindow
      heading={
        isEmpty(data)
          ? "Create Notification Channel"
          : "Edit Notification Channel"
      }
      showModal={toggleModal}
      closeModal={closeModal}
      loading={loading}
      error={error}
    >
      {buildForm()}
      <div className="text-right">
        <Button type="button" color="success" onClick={onClickSave}>
          Save
        </Button>
        {"   "}
        <Button type="button" color="danger" onClick={closeModal}>
          Close
        </Button>
      </div>
    </ModalWindow>
  );
};
const mapStateToProps = (state) => ({
  user: get(state, "auth.user"),
});

NotificationChannelCreateEditModal.propTypes = {
  data: PropTypes.objectOf(Object).isRequired,
  user: PropTypes.objectOf(Object).isRequired,
  actionType: PropTypes.string.isRequired,
  refreshGrid: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(NotificationChannelCreateEditModal);
