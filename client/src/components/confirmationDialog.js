import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

import ModalWindow from './modalWindow';

class ConfirmationDialog extends Component {
  constructor(props) {
    super(props)
  }

  onClickClose = () => {
    this.setState({ show: false });
  }

  buildForm = () => {
    const { closeModal, onClickConfirm, helpText, confirmButtonText = 'Confirm' } = this.props
    return (
      <>
      <div>
        <p>{helpText ? helpText : 'Are you sure you want to delete?'}</p>
        <Button color="success" onClick={onClickConfirm}>{confirmButtonText}</Button>{" "}
        <Button color="danger" onClick={closeModal ? closeModal : this.onClickClose}>Close</Button>{" "}
      </div>
      </>
    )
  }

  render() {
    const { heading, loading, error, showModal, closeModal } = this.props
    
    return (
      <ModalWindow
        showModal={showModal}
        closeModal={closeModal ? closeModal : this.onClickClose}
        heading={heading}
        loading={loading}
        error={error}
      >
        {this.buildForm()}
      </ModalWindow>
    )
  }
}

ConfirmationDialog.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ message: PropTypes.string })
  ]),
  heading: PropTypes.string,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
  helpText: PropTypes.string,
  confirmButtonText: PropTypes.string
}

export default ConfirmationDialog
