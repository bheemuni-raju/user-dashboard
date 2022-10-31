import React, { Component, Children } from 'react'
import { Modal, ModalBody, ModalHeader, Button, Row, Col, ModalFooter } from 'reactstrap'
import PropTypes from 'prop-types'

import { Page, PageHeader, PageBody } from './page'
import { Box, BoxBody } from './box'
import { Spin } from 'antd'

class ModalWindow extends Component {

  render() {
    const { heading, loading = false, error, showModal, closeModal,
      className, children, closeButton, size = "lg", image, style,
      addOkCancelButtons, onClickOk, okText, cancelText = "Close" } = this.props;
    const imageStyle = { width: '100%' };

    return (
      <Modal
        isOpen={showModal}
        toggle={closeModal}
        backdrop={true}
        keyboard={true}
        size={size}
        style={style}
        className={`modal-info ${className}`}>
        <ModalHeader className="modal-colored-header bg-primary" toggle={closeModal}>{heading}</ModalHeader>
        <ModalBody>
          <BoxBody loading={loading} error={error}>
            <Spin spinning={loading}>
              {image ?
                <Row style={{ maxHeight: '60%' }}>
                  <Col md={4}>
                    <img src={image} style={imageStyle} alt="Modal Image"></img>
                  </Col>
                  <Col md={8}>
                    {children}
                  </Col>
                </Row> :
                <div>
                  {children}
                </div>
              }
            </Spin>
          </BoxBody>
        </ModalBody>
        <ModalFooter className="modal-colored-header bg-primary">
          {addOkCancelButtons &&
            <div className="text-right empty-row">
              <Button type="button" color="success" onClick={onClickOk}>{okText || 'Ok'}</Button>
              {'   '}
              <Button type="button" color="danger" onClick={closeModal}>{cancelText || 'Close'}</Button>
            </div>}
        </ModalFooter>
      </Modal>
    )
  }
}

ModalWindow.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ message: PropTypes.string })
  ]),
  heading: PropTypes.string,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
  closeButton: PropTypes.bool
}

export default ModalWindow
