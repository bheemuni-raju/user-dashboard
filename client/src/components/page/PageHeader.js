import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

import { AppConsumer } from '../../Application';

import './page.css';

const PageHeader = ({ heading, showLogo, center, children, childrenInline, topTabs }) => {
  const closeBtnStyle = {
    float: 'right',
    background: '#dc3545',
    border: 'red'
  }

  return (<AppConsumer>
    {
      context => (<section className={`page-header ${center ? 'text-center' : ''}`}>
        <Fragment>
          <h4 style={{ display: 'inline' }}>{heading} {childrenInline && children} </h4>
          <Button style={closeBtnStyle} onClick={() => onClickClose(context)}>
            <i className="fa fa-close"></i>
          </Button>
        </Fragment>
        {!childrenInline && children}
      </section>)
    }
  </AppConsumer>);
}

const onClickClose = (context) => {
  const { history } = context || {};

  history && history.goBack();
}

PageHeader.propTypes = {
  heading: PropTypes.any,
  showLogo: PropTypes.bool,
  center: PropTypes.bool,
  children: PropTypes.node,
  childrenInline: PropTypes.bool
}

export default PageHeader
