import React from 'react'
import PropTypes from 'prop-types'

import { ErrorWrapper } from '../error'

const PageBody = ({ children, error, errorTop, errorBottom }) => (
  <section className="page-body">
    <ErrorWrapper
      error={error}
      errorTop={true}
      errorBottom={errorBottom}
    >
      {children}
    </ErrorWrapper>
  </section>
)

PageBody.propTypes = {
  children: PropTypes.node,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ message: PropTypes.string })
  ]),
  errorTop: PropTypes.bool,
  errorBottom: PropTypes.bool
}

export default PageBody
