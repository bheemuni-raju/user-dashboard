import React from 'react'
import PropTypes from 'prop-types'

const LoadingWrapper = ({ loading, children, ...props }) =>
  <div {...props}>
    {children}
    {loading &&
      <div tabIndex="-1" className="overlay">
        <i style={{ position: 'fixed', top: '50%', left: '50%' }} className="fa fa-2x fa-refresh fa-spin"></i>
      </div>
    }
  </div>

LoadingWrapper.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node
}

export default LoadingWrapper
