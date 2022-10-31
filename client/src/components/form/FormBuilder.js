import React, { Component, Fragment } from 'react'
import P from 'prop-types'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

import { chunk, isEmpty, isEqual, isObject, isArray, get, map, remove, pick } from 'lodash'
import { Row, Col, Label, Button } from 'reactstrap'

import FieldGroup from './FieldGroup'
import ByjusCombobox from 'modules/core/components/combobox/ByjusComboBox'
import { Radio, Rate } from 'antd'

const { Group: RadioGroup, Button: RadioButton } = Radio;

class FormBuilder extends Component {
  static propTypes = {
    fields: P.array.isRequired,
    cols: P.number
  }

  static defaultProps = {
    fields: [],
    cols: 1
  }


  constructor(props) {
    super(props)
    this.state = {
      formValues: {},
      validationErrors: {},
      fields: [],
      passwordType: "password",
      eyeIcon: "fa fa-eye-slash"
    }
  }

  viewPassword = () => {
    if (this.state.passwordType == "password") {
      this.setState({ passwordType: "text" })
    }
    else {
      this.setState({ passwordType: "password" })
    }

    if (this.state.eyeIcon == "fa fa-eye-slash") {
      this.setState({ eyeIcon: "fa fa-eye" })
    }
    else {
      this.setState({ eyeIcon: "fa fa-eye-slash" })
    }
  }

  handleFieldChanges = (e, passedOnChange) => {
    let { name, value, type } = e.target
    value = (type == "file") ? e.target.files[0] : value

    this.handleFormChanges(name, value, type, passedOnChange);

  }

  handleRateChanges = (e, rateName, passedOnChange) => {
    this.handleFormChanges(rateName, e, "rate", passedOnChange);
  }

  handleRadioChanges = (e, name, passedOnChange) => {
    this.handleFormChanges(name, e, "radio", passedOnChange);
  }

  onChangeReactDate = (name, date) => {
    const { formValues } = this.state
    formValues[name] = date
    this.setState({ formValues })
  }

  handleFormChanges = (name, selectedValue, type, passedOnChange) => {
    const { formValues } = this.state;
    const originalValue = selectedValue;

    if (isArray(selectedValue) && type != "file") {
      selectedValue = map(selectedValue, 'value') || [];
      remove(selectedValue, n => !n);
    }
    else if (isObject(selectedValue) && type != "file") {
      selectedValue = get(selectedValue, 'value')
    }

    formValues[name] = selectedValue;

    this.setState({ formValues });
    passedOnChange && passedOnChange(selectedValue, name, originalValue);
  }

  formField = (field) => {
    const { type = "text" } = field
    switch (type) {
      case 'text':
      case 'textarea':
      case 'date':
      case 'number':
      case 'readonly':
      case 'readonlytext':
      case 'checkbox':
      case 'link':
      case 'email': return this.buildInputField(field);
      case 'file': return this.buildFileField(field);
      case 'select': return this.buildCombobox(field);
      case 'reactDate': return this.buildReactDate(field);
      case 'button': return this.buildButton(field);
      case 'radio': return this.buildAntdRadioButton(field);
      case 'rate': return this.buildAntdRateField(field);
      case 'hidden':
      case 'password': return this.buildPasswordField(field);
      case 'default': return (<Fragment />);
    }
  }

  buildInputField = (field) => {
    let { type, name, label, placeholder, value, required, error, options, inline, disabled, onChange, help, style } = field
    const { formValues } = this.state
    value = !isEmpty(formValues) ? formValues[name] : value

    //If type is date, format the value to set value in datepicker
    if (type == "date") {
      value = value && moment(value).format('YYYY-MM-DD');
    }
    return <FieldGroup
      {...field}
      name={name}
      type={type}
      disabled={type == "readonly" ? true : disabled}
      label={label}
      placeholder={placeholder}
      value={value || ""}
      options={options || null}
      inline={inline}
      valid={error ? "error" : null}
      errorMessage={error}
      required={required}
      onChange={(e) => this.handleFieldChanges(e, onChange)}
    />
  }

  buildPasswordField = (field) => {
    let { type, name, label, placeholder, value, required, error, options, inline, disabled, onChange } = field
    const { formValues } = this.state
    value = !isEmpty(formValues) ? formValues[name] : value

    const comp = <FieldGroup
      {...field}
      name={name}
      type={this.state.passwordType}
      disabled={type == "readonly" ? true : disabled}
      label={label}
      placeholder={placeholder}
      value={value || ""}
      options={options || null}
      inline={inline}
      valid={error ? "error" : null}
      errorMessage={error}
      required={required}
      onChange={(e) => this.handleFieldChanges(e, onChange)}
    />

    return (
      <Fragment>
        {comp}
        <button class="password-button" onClick={() => this.viewPassword()}><i class={this.state.eyeIcon}></i></button>
      </Fragment>
    )
  }

  buildFileField = (field) => {
    let { type, name, label, placeholder, value, required, accept, innerHtml, error, onChange } = field
    const { formValues } = this.state

    value = !isEmpty(formValues) ? formValues[name] : value
    return <FieldGroup
      {...field}
      name={name}
      type={type}
      label={label}
      placeholder={placeholder}
      innerHtml={innerHtml}
      files={value || ""}
      accept={accept}
      valid={error ? "error" : null}
      errorMessage={error}
      required={required}
      onChange={(e) => this.handleFieldChanges(e, onChange)}
    />
  }

  buildCombobox = (field) => {
    let { name, label, placeholder, value, required,
      options, model, displayKey, valueKey, isMulti, valueRenderer, filter, loadByDefault, error, onChange, limit, dbType } = field
    const { formValues } = this.state

    value = !isEmpty(formValues) ? formValues[name] : value
    const customStyles = {
      control: () => {
        return {
          borderColor: !error ? '#ddd' : 'red'
        }
      }
    }

    let comp = <div />

    /**Local combobox */
    if (isArray(options)) {
      comp = <ByjusCombobox
        {...field}
        label={label}
        name={name}
        styles={customStyles}
        value={value ? value : ""}
        isMulti={isMulti}
        limit={limit}
        valid={value || ""}
        dbType={dbType}
        placeholder={placeholder}
        options={options ? options : null}
        onChange={(name, selectedValue) => this.handleFormChanges(name, selectedValue, null, onChange)}
        valueRenderer={valueRenderer}
        required={required}
      />
    }
    /**Remote combobox */
    else {
      comp = <ByjusCombobox
        {...field}
        label={label}
        name={name}
        styles={customStyles}
        value={value ? value : ""}
        isMulti={isMulti}
        valid={value || ""}
        placeholder={placeholder}
        model={model}
        filter={filter}
        displayKey={displayKey}
        valueKey={valueKey}
        dbType={dbType}
        loadByDefault={loadByDefault}
        onChange={(name, selectedValue) => this.handleFormChanges(name, selectedValue, null, onChange)}
        valueRenderer={valueRenderer}
        required={required}
      />

    }
    return (
      <Fragment>
        {comp}
        <div>{error &&
          <div style={{ 'color': 'red' }}>
            {error}
          </div>}
        </div>
      </Fragment>
    )
  }

  buildAntdRateField = (field) => {
    const { formValues } = this.state;
    let { label, name, value, count, tooltips, required
      , onChangeRate, onAfterChange } = field;

    value = !isEmpty(formValues) ? formValues[name] : value;

    return (
      <Fragment>
        {label && this.renderLabel(required, label)}<br />
        <Rate
          count={count}
          value={value}
          tooltips={tooltips}
          onChange={(e) => { this.handleRateChanges(e, name, onChangeRate) }}
          onAfterChange={onAfterChange} />
      </Fragment>
    );
  }

  buildAntdRadioButton = (field) => {
    const { label, name, required, options, size = 'default', onChange } = field;

    let selectedOption = options.find(option => option.checked == true);

    return (
      <Fragment>
        {label && this.renderLabel(required, label)}<br />
        <RadioGroup size={size}
          options={options}
          value={selectedOption && selectedOption.value}
          onChange={(e) => { this.handleRadioChanges(e, name, onChange) }}
          {...field}
        />
      </Fragment>
    );
  }

  buildReactDate = (field) => {
    let { name, label, filter, required, disabled } = field;
    const { formValues } = this.state
    let value = formValues[name]
    let date = value ? (typeof value !== "object" ? new Date(value) : value) : null;
    return (
      <Fragment>
        {label && this.renderLabel(required, label)}
        <DatePicker
          {...field}
          calendarIcon="Calendar"
          name={name}
          required={required}
          disabled={disabled}
          selected={date}
          onChange={date => this.onChangeReactDate(name, date)}
          className="form-control"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={1}
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </Fragment>
    );
  }

  buildButton = (field) => {
    let { name, text, bsStyle, disabled, onClick, style, icon } = field;

    return (<Button
      name={name}
      color={bsStyle || "primary"}
      disabled={disabled || false}
      onClick={onClick ? onClick : null}
      style={style}
      {...field}
    >
      {(icon && <i className={icon} />)} {text}
    </Button>);
  }

  renderLabel = (required, label) => {
    const star = (required) ? <span style={{ color: 'red' }}>*</span> : ''

    return (
      <Label>
        {label} {star}
      </Label>
    )
  }

  getFormValues = () => {
    let formValues = this.filterFormValues();

    Object.keys(formValues).map((key) => {
      formValues[key] = (formValues[key] && formValues[key].trim) ? formValues[key].trim() : formValues[key]
    });
    return formValues
  }

  setFormValues = (updatedVlues = {}) => {
    this.setState({ formValues: updatedVlues })
  }

  emptyFormValues = () => {
    this.setState({ formValues: {} })
  }

  setFormValues = (newFormValues) => {
    /**
     * While setting formValues make sure merge the existing
     * formValues with the incoming formValues as well
    */
    const allFormValues = {
      ...this.state.formValues,
      ...newFormValues
    }
    this.setState({ formValues: allFormValues });
  }

  /**Validate Form Values */
  validateForm = () => {
    const { fields, formValues } = this.state;
    let validationErrors = {}
    fields.map((field) => {
      if (field.required && !formValues[field["name"]]) {
        validationErrors[field["name"]] = `${field["label"]} is required`
      }
    })

    document.scrollingElement.scrollIntoView();
    return validationErrors;
  }

  filterFormValues = () => {
    const { exactFormValues } = this.props;
    let { fields, formValues } = this.state;
    const fieldKeys = map(fields, 'name');

    if (exactFormValues) {
      formValues = pick(formValues, fieldKeys);
    }

    return formValues;
  }

  /**Validate Form  and get Values if valid */
  validateFormAndGetValues = () => {
    const { validateValues } = this.props;
    let { fields, formValues } = this.state;

    formValues = this.filterFormValues();
    let validationErrors = {}
    fields.map((field) => {
      if (field.required && !formValues[field["name"]]) {
        validationErrors[field["name"]] = `${field["label"] || field["name"]} is required`
      }
    });

    if (isEmpty(validationErrors)) {
      /**If extra validations are to be performed, pass validateValues as  a function for which input param will be formValues */
      const additionalValidationErrors = validateValues ? validateValues(formValues) : {};
      this.setState({ validationErrors: additionalValidationErrors });
      if (!isEmpty(additionalValidationErrors)) {
        document.scrollingElement.scrollIntoView();
        // this.setState({ validationErrors: additionalValidationErrors });
        return null;
      }
      return this.getFormValues();
    }
    else {
      document.scrollingElement.scrollIntoView();
      this.setState({ validationErrors });
      return null;
    }
  }

  componentWillReceiveProps = (nextProps, nextState) => {
    const { formValues } = this.state;

    /**Update the form validationsErrors with the incoming validationErrors */
    if (!isEqual(this.props.validationErrors, nextProps.validationErrors)) {
      this.setState({ validationErrors: nextProps.validationErrors })
    }

    /**Update the formvalues with the initialValues passed */
    if (!isEmpty(nextProps.initialValues) && nextProps.initialValues && !isEqual(nextProps.initialValues, this.props.initialValues)) {
      /**If formValues are empty, take incoming initialValues else merge formvalues and initialValues */
      isEmpty(this.state.formValues) ?
        this.setState({ formValues: nextProps.initialValues }) :
        this.setState({ formValues: { ...formValues, ...nextProps.initialValues } });
    }

    /**Update the form fields dynamically */
    if (!isEqual(nextProps.fields, this.state.fields)) {
      this.setState({ fields: nextProps.fields });
    }
  }

  componentDidMount = () => {
    const { initialValues, validationErrors, fields } = this.props
    this.setState({
      fields,
      formValues: !isEmpty(initialValues) ? initialValues : {},
      validationErrors
    })
  }

  render = () => {
    let { fields = [] } = this.state;
    const { cols, rows } = this.props
    const { validationErrors } = this.state
    const rowDivision = rows || cols;
    remove(fields, (n) => !n);
    const fieldRows = chunk(fields, rowDivision)
    let md = Math.ceil(12 / cols)

    const fieldDOM = fieldRows.map((fieldRow, index) => {
      return <Fragment key={index}>
        <Row>
          {fieldRow.map((field, index) => {
            const { name } = field
            field["error"] = validationErrors ? validationErrors[name] : null
            return <Col key={index} md={field.md || md}>
              {this.formField(field)}
            </Col>
          })}
        </Row>
        <div className="empty-row" />
      </Fragment>
    })

    return (
      <Fragment>
        {fieldDOM}
      </Fragment>
    )
  }
}

export default FormBuilder
