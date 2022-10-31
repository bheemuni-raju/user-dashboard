import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import Error from './Error'

const ErrorWrapper = ({
  children,
  error,
  errorTop,
  errorBottom,
}) => {
  // if error position not specified, render top and bottom
  const errorPos = errorTop || errorBottom

  const component = error ? (<div style={{padding : '5px'}}>
      {(errorTop || !errorPos) &&
        <Error error={error} />
      }
      {children}
      {(errorBottom || !errorPos) &&
        <Error error={error} />
      }
    </div>) : <>{children}</>
  
  return component;
}

ErrorWrapper.propTypes = {
  children: PropTypes.node,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({message: PropTypes.string})
  ]),
  errorTop: PropTypes.bool,
  errorBottom: PropTypes.bool
}

export default ErrorWrapper