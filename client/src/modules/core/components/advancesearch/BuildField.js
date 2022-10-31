import React from 'react';
import DatePicker from "react-datepicker";
import { Input } from "reactstrap";
import { chunk, isEmpty, isEqual, isObject, isArray, get, map } from 'lodash'

import FieldGroup from 'components/form/FieldGroup';
import ByjusCombobox from 'modules/core/components/combobox/ByjusComboBox';

class BuildField extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            formValues: {},
            validationErrors: {}
        }
    }

    handleFieldChange = (e) => {
        let { name, value, type } = e.target;
        value = (type == "file") ? e.target.files[0] : value;

        this.handleFormChange(name, value, type);
    }

    handleDateChange = (name, date) => {
        const { formValues } = this.state;
        formValues[name] = date;
        this.setState({ formValues });
    }

    handleFormChange = (name, value, type) => {
        const { formValues } = this.state;

        if (isArray(value) && type != "file") {
            value = map(value, 'value');
        }
        else if (isObject(value) && type != "file") {
            value = get(value, 'value');
        }
        formValues[name] = value;

        this.setState({ formValues });
        this.props.onChangeValue && this.props.onChangeValue({
            label: value,
            value
        })
    }

    formField = (field) => {
        const { filterType:type = "text" } = field;
        switch (type.toLowerCase()) {
            case 'text':
            case 'textarea':
            case 'date':
            case 'number':
            case 'readonly':
            case 'readonlytext':
            case 'checkbox':
            case 'email': return this.buildInputField(field)
            case 'file': return this.buildFileField(field)
            case 'select': return this.buildCombobox(field)
            case 'reactDate': return this.buildReactDate(field)
            case 'default': return <Fragment />
        }
    }

    buildInputField = (field) => {
        let { type, dataField: name, value, disabled } = field;
        const { formValues } = this.state;

        value = !isEmpty(formValues) ? formValues[name] : value;
        return <Input
            name={name}
            type={type}
            disabled={type == "readonly" ? true : disabled}
            value={value || ""}
            onChange={this.handleFieldChange}
        />
    }

    buildCombobox = (field) => {
        let { dataField: name, value, required,
            options, model, displayKey, valueKey, isMulti, valueRenderer, filter, loadByDefault, error } = field;
        const { formValues } = this.state;

        value = !isEmpty(formValues) ? formValues[name] : value;
        const customStyles = {
            control: () => {
                return {
                    borderColor: !error ? '#ddd' : 'red'
                }
            }
        }
        let component = <div />

        /**Local combobox */
        if (isArray(options)) {
            component = <ByjusCombobox
                label={''}
                name={name}
                styles={customStyles}
                value={value ? value : ""}
                isMulti={isMulti}
                valid={value || ""}
                placeholder={placeholder}
                options={options ? options : null}
                onChange={this.handleFormChange}
                valueRenderer={valueRenderer}
                required={required}
                {...field}
            />
        }
        /**Remote combobox */
        else {
            component = <ByjusCombobox
                label={''}
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
                loadByDefault={loadByDefault}
                onChange={this.handleFormChange}
                valueRenderer={valueRenderer}
                required={required}
                {...field}
            />

        }
        return (
            <Fragment>
                {component}
            </Fragment>
        )
    }

    buildReactDate = (field) => {
        let { dataField: name, filter, required, value } = field;

        return (
            <Fragment>
                <DatePicker
                    calendarIcon="Calendar"
                    name={name}
                    selected={value ? value : null}
                    onChange={(date) => this.handleDateChange(name, date)}
                    className="form-control"
                    dateFormat="YYYY-MM-DD"
                    filterDate={filter}
                    withPortal
                />
            </Fragment>
        )
    }

    render() {
        const { field: { } } = this.props;
        return (
            <div>
                {this.formField(this.props.field)}
            </div>
        )
    }
}

export default BuildField;
