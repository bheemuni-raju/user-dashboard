import React from 'react'
import P from 'prop-types'
import { compose, setPropTypes, withHandlers } from 'recompose'
import { FormGroup, Label, Input } from 'reactstrap'

const withPropTypes = setPropTypes({
  name: P.any,
  label: P.string,
  readOnly: P.bool,
  onClick: P.func,
  children: P.node
})

const withClickHandler = withHandlers({
  handleCheckboxClick: ({ readOnly, onChange }) => ev =>
    readOnly ? ev.stopPropagation() : onChange && onChange(ev)
})

const Checkbox = ({ handleCheckboxClick, children, name, ...rest }) => {
  const { checked, style } = rest;

  return (
    <FormGroup check style={{ display: "inline-block", marginRight: '3%', ...style }}>
      <Label check>
        <Input type="checkbox" checked={checked} onChange={handleCheckboxClick} name={name} {...rest} />{' '}
        {children}
      </Label>
    </FormGroup>
  )
}


export default compose(
  withPropTypes,
  withClickHandler
)(Checkbox)
