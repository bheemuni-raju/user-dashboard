
import React from 'react'
import {
  Label,
  Input,
  FormText,
  FormFeedback,
  FormGroup
} from 'reactstrap';

import Checkbox from './Checkbox'

const FieldGroup = ({
  name,
  type,
  fieldType,
  label,
  help,
  icon,
  valid,
  touched,
  errorMessage,
  formGroupClass,
  style,
  required,
  innerHtml,
  externalLink,
  ...props
}) => {
  if (type === 'readonlytext') return renderReadOnlyText(label, props)
  let urlName;

  return (
    <FormGroup
      //controlId={name}
      //validationState={valid}
      className={formGroupClass}
      style={style}
    >
      {innerHtml && <div><a href={innerHtml} target="_blank">{`${label} download`}</a></div>}
      {label && renderLabel(required, label)}

      {renderField(type || fieldType, name, props)}

      {icon &&
        <FormFeedback>
          <i className={icon}></i>
        </FormFeedback>
      }
      {(errorMessage) && <FormFeedback>{errorMessage}</FormFeedback >}
      {help && <FormText >{help}</FormText>}
    </FormGroup>
  )
}

export default FieldGroup

function renderField(type, name, props) {

  const { options, inline, children, error, ...rest } = props
  const isErrorExists = error ? true : false;

  if (type === 'checkbox') return renderCheckbox(name, options, inline, rest)
  if (type === 'radio') return renderRadio(name, options, inline, rest)

  if (type === 'select') {
    return (
      <Input name={name} {...rest} invalid={isErrorExists}>
        <option value="">-Select-</option>
        {renderSelectOptions(name, options, inline, props)}
      </Input>
    )
  }

  if (type == "textarea") {
    return (
      <Input name={name} {...props} type="textarea" invalid={isErrorExists} />
    )
  }

  if (type == "link") {
    return renderLink(name, props);
  }

  return (
    <Input name={name} type={type} {...rest} invalid={isErrorExists} />
  )
}

function renderReadOnlyText(label, props) {
  const { inline, value } = props
  const divStyle = {
    display: 'flex',
    flexWrap: 'nowrap',
    padding: '10px'
  }
  const labelStyle = {
    maxWidth: '50%',
    flexGrow: '1'
  }

  return (<div style={divStyle}>
    <strong style={labelStyle}>{label}</strong>
    {inline ?
      <span style={{width:'70%'}}>{" "}{value ? value : '---'}</span> :
      <div style={{width:'70%'}}>{" "}{value ? value : '---'}</div>}
  </div>)
}

function renderLink(name, props) {
  const { value, displayValue, target = "_blank", tooltip } = props;
  const spanStyle = {
    display: 'inline',
    flexWrap: 'nowrap',
    padding: '10px'
  }

  return (<span style={spanStyle}>
    <strong>
      <a href={value} title={tooltip || value} target={target}>{displayValue || value}</a>
    </strong>
  </span>);
}

function renderSelectOptions(name, options, inline, props) {
  return (options && options.length && options.map((option, i) => {
    const text = option.text ? option.text : option && option.toUpperCase()
    const value = option.value ? option.value : option
    const rest = option.text && { ...option }
    return (
      <option key={`${i}${value}`} value={value} {...rest}>
        {text}
      </option>
    )
  })
  )
}

function renderRadio(name, options, inline, props) {
  return (
    <div>
      {options && options.map((option, i) => {
        const value = option.value || option
        return (
          <FormGroup check>
            <Label check>
              <Input
                type="radio"
                key={i}
                name={name}
                {...props}
                value={value}
                checked={value === props.value}
              /> {option.label || option}
            </Label>
          </FormGroup>
        )
      })}
    </div>
  )
}

function renderCheckbox(name, options, inline, props) {
  return Array.isArray(options) ?
    <div>
      {options && options.map((option, i) =>
        <Checkbox
          key={i}
          name={name}
          {...props}
          value={option.value || option}
          onChange={(e) => props.onChange(e, option)}
          checked={isChecked(props.value, option.value)}
          inline={inline || false}
        >
          {option.label || option}
        </Checkbox>
      )}
    </div> :
    <Checkbox name={name} {...props}>
      {options && options.split(',')}
    </Checkbox>
}

function isChecked(value, option) {
  if (!Array.isArray(value)) return false
  return typeof (value.find(val => val === option)) !== 'undefined'
}


function renderLabel(required, label) {
  const star = (required) ? <span style={{ color: 'red' }}>*</span> : ''

  return (
    <Label>
      {label} {star}
    </Label>
  )
}
