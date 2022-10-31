import React from 'react'
import P from 'prop-types'
import { Col, Row, Alert } from 'reactstrap'

const Error = ({ error }) => {
  if (!error) return null

  document.scrollingElement.scrollIntoView()
  return (
    <Row>
      <Col xs={12}>
        <Alert color="danger">
          <div style={{ whiteSpace: "pre-wrap" }}>
            <i className="icon fa fa-exclamation-triangle" />
            {` ${error.message || error}`}
          </div>
        </Alert>
      </Col>
    </Row>
  )
}

Error.propTypes = {
  error: P.oneOfType([
    P.string,
    P.shape({ message: P.string })
  ])
}

export default Error
