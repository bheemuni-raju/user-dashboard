import React from 'react'
import P from 'prop-types'

import LoadingWrapper from '../LoadingWrapper'

const Page = ({loading, children}) =>
  <LoadingWrapper loading={loading}>
    <div className="page">
      {children}
    </div>
  </LoadingWrapper>

Page.propTypes = {
  loading: P.bool,
  children: P.node
}

export default Page
