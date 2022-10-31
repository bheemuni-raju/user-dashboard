
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SemanticVersion from 'components/SemanticVersion';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
     
    return (
      <React.Fragment>
        <div
          style={{ position: 'relative', left: '5%' }}>
          UMS &copy; 2022
          <a target="_blank" href="https://byjus.com"> Byjus</a>.          
        </div>
        <SemanticVersion/>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;


