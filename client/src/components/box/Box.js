import React from 'react'
import P from 'prop-types'
import { Col, Row } from 'reactstrap'

const Box = ({ children, type = 'info', style, solid, ...props }) => {
  return (
    <div className={`card ${props.className}`}>
      {children}
    </div>
  )
}

Box.propTypes = {
  children: P.node,
  type: P.string,
  style: P.object,
  solid: P.bool
}

export default Box
