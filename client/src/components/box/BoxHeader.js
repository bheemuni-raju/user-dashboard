import React from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col } from 'reactstrap';

import { AppConsumer } from '../../Application';

const BoxHeader = ({ children, heading, headingColor, closeBtn, infoIcon, showInfoImage, headingComponent }) => {
  const headingStyle = { color: `${headingColor || ''}`, display: 'inline' }
  const closeBtnStyle = {
    float: 'right',
    background: '#dc3545',
    border: 'red'
  }

  const infoIconStyle = {
    float: 'right',
    cursor: 'pointer'
  }

  return (
    <AppConsumer>
      {
        context => (<div className="card-header">
          <Row>
            <Col>
              <h5 className={`box-title ${headingColor || ''} `} style={headingStyle}>
                {heading}
              </h5>
            </Col>
            <div className="d-flex justify-content-end">
              {headingComponent && headingComponent}
              {closeBtn && <Button style={closeBtnStyle} onClick={() => onClickClose(context)}>
                <i className="fa fa-close"></i>
              </Button>}
            </div>
          </Row>

          {children}
        </div>)
      }
    </AppConsumer>
  )
}

const onClickClose = (context) => {
  const { history } = context || {};

  history && history.goBack();
}

BoxHeader.propTypes = {
  children: PropTypes.node,
  heading: PropTypes.string,
  headingColor: PropTypes.string
}


export default BoxHeader
