import React, { Component, Fragment } from 'react'
import Select from 'react-select'
import { Label } from 'reactstrap'
import {
    isEqual, get, concat, isEmpty, isArray,
    isObject, map, remove, uniqWith
} from 'lodash'

import { callApi } from 'store/middleware/api'

import 'react-select/dist/react-select.css';

class ByjusComboBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            options: [],
            inputValue: "",
            selectedValue: null
        }
    }

    getComboValues = async () => {
        const { options, apiConfig, enumId } = this.props;

        /*Combobox with Local values*/
        if (options) {
            this.processComboResponse(options);
        }
        /*Combobox with remote values*/
        else if (enumId) {
            this.getEnumOptions();
        }
        else {
            if (apiConfig) {
                this.makeCallWithoutModel();
            }
            else {
                this.makeCallWithModel();
            }
        }
    }

    getEnumOptions = async () => {
        let { enumId } = this.props;

        const apiUrl = `/usermanagement/settings/enum/${enumId}`;
        const apiMethod = 'GET';
        try {
            this.setState({ loading: true });
            await callApi(apiUrl, apiMethod, null, null, null, true)
                .then(response => {
                    this.processComboResponse(response.enums || []);
                })
                .catch(error => {
                    return error
                });
        } catch (error) {
            throw new Error(error);
        }
    }

    makeCallWithoutModel = async () => {
        const { displayKey, valueKey, apiConfig } = this.props;
        const { url, method: apiMethod, body, isNucleusApi } = apiConfig;

        const apiUrl = isNucleusApi ? `${window.NAPI_URL}${url}` : url;
        const apiBody = apiMethod == "GET" ? null : body;
        try {
            this.setState({ loading: true });
            const options = {
                method: apiMethod,
                headers: this.generateRequestHeaders(),
                body: apiBody ? this.formatRequestBody(apiBody) : null,
                credentials: "same-origin"
            };

            this.setState({ loading: true });
            await fetch(apiUrl, options).then(res =>
                res.json()
                    .then(response => {
                        // if (!response.ok)
                        //     return Promise.reject({ ...json, status: response.status });
                        this.processComboResponse(response);
                    })
                    .catch(error => {
                        return error;
                    })
            );
        } catch (error) {
            throw new Error(error);
        }
    }

    makeCallWithModel = async () => {
        let { displayKey, valueKey, model, filter = {}, isMulti, limit, dbType } = this.props;
        const { inputValue, searchableValues } = this.state;

        /**dispalyKey and valueKeyFilter should go as or condition */
        let bodyPayload;
        if (dbType == "pg") {
            bodyPayload = {
                model, filter, displayKey, valueKey, limit, inputValue
            }
        } else {
            let extraFilter = [
                inputValue ? {
                    [displayKey]: { $regex: inputValue, $options: "i" }
                } : null,
                (isMulti && searchableValues) ? {
                    [valueKey]: (isArray(searchableValues)) ? { $in: searchableValues } : searchableValues
                } : null];

            remove(extraFilter, f => isEmpty(f));
            const updatedFilter = !isEmpty(extraFilter) ? {
                "$or": extraFilter
            } : {};

            filter = filter && Object.assign(filter, updatedFilter)

            bodyPayload = {
                model, filter, displayKey, valueKey, limit
            }
        }

        const apiUrl = (dbType == "pg") ? `/usermanagement/common/pgcombo` : `/usermanagement/common/combo`;
        const apiMethod = 'POST';
        const apiBody = bodyPayload;
        try {
            this.setState({ loading: true });
            await callApi(apiUrl, apiMethod, apiBody, null, null, true)
                .then(response => {
                    this.processComboResponse(response);
                })
                .catch(error => {
                    return error
                });
        } catch (error) {
            throw new Error(error);
        }
    }

    processComboResponse = (response) => {
        const { options } = this.state;
        const { displayKey = "label", valueKey = "value", isMulti } = this.props;

        if (Array.isArray(response)) {
            let updatedOptions = response.map((res) => {
                return {
                    label: isObject(res) ? get(res, displayKey || 'label') : res,
                    value: isObject(res) ? get(res, valueKey || 'value') : res
                }
            });

            /**If multi select, append the serchable values to the existing list, else the initial values will be removed. */
            if (isMulti) {
                updatedOptions = uniqWith(concat(updatedOptions, options), isEqual);

            }

            this.setState({ options: updatedOptions, loading: false });
        }

        return options;
    }

    generateRequestHeaders = () => {
        return new Headers({
            "Content-Type": "application/json"
        });
    }

    formatRequestBody = (body) => {
        return JSON.stringify(body);
    }

    onInputChange = (newValue) => {
        newValue = newValue && newValue.trim();
        if (newValue) {
            this.setState({ inputValue: newValue });
        }
    }

    getFormattedInitialValue = (value) => {
        const { displayKey, valueKey } = this.props;

        if (value) {
            if (isArray(value)) {
                const formattedValues = value.map((val) => {
                    return (!isObject(val)) ? val : val[valueKey]
                });

                return formattedValues;
            }
            else if (isObject(value)) {
                return value[valueKey];
            }
            else {
                return value;
            }
        }
    }

    componentDidUpdate = (prevProps, pervState) => {
        if (!isEqual(prevProps.filter, this.props.filter)) {
            this.getComboValues()
        }
        if (!isEqual(pervState.inputValue, this.state.inputValue)) {
            this.getComboValues()
        }

        if (!isEqual(prevProps.options, this.props.options)) {
            this.processComboResponse(this.props.options);
        }
    }

    componentWillReceiveProps = (nextProps, nextState) => {
        if (!isEmpty(nextProps.options) && !isEqual(nextProps.options, this.props.options)) {
            this.setState({ options: nextProps.options })
        }
    }

    componentDidMount = async () => {
        const { loadByDefault, isMulti, value, displayKey } = this.props;

        /**For multi select - if initial value is passed, take all the values 
         * in array and set it as inputValue so that it will get set properly */
        if (isMulti && !isEmpty(value)) {
            const searchableValues = value.map(val => isObject(val) ? get(val, displayKey) : val);
            this.setState({ searchableValues }, () => {
                this.getComboValues()
            });
        }

        /**Load the combobox, unless loadByDefault is specified as false*/
        if (loadByDefault !== false) {
            await this.getComboValues()
        }
    }

    render() {
        const { options, loading } = this.state
        /**@stateKey : state value which needs to be updated*/
        const { label, name, value, placeholder, defaultValue,
            onChange, onInputChange, required, isMulti, stateKey, disabled, loading: passedLoading,
            valueRenderer, customStyles, className, onBlur,
            displayKey, valueKey, filterOptions } = this.props;

        /**If filterOption function is passed, filter the options  */
        const formatOptionsArray = filterOptions ? filterOptions(options) || [] : options;

        return (
            <Fragment>
                {label && this.renderLabel(required, label)}
                <Select
                    styles={customStyles}
                    className={className}
                    options={formatOptionsArray}
                    label={label}
                    name={name}
                    value={value}
                    isLoading={loading || passedLoading}
                    placeholder={placeholder || 'Please start typing'}
                    defaultValue={defaultValue}
                    multi={isMulti ? true : false}
                    isSearchable={true}
                    onInputChange={onInputChange || this.onInputChange}
                    valueRenderer={valueRenderer ? valueRenderer : null}
                    onChange={onChange && ((selectedOption) => {
                        onChange(name, selectedOption, isMulti, stateKey)
                    })}
                    disabled={disabled || false}
                    onBlur={onBlur}
                />
            </Fragment>
        )
    }

    renderLabel = (required, label) => {
        const star = (required) ? <span style={{ color: 'red' }}>*</span> : ''

        return (
            <Label>
                {label} {star}
            </Label>
        )
    }
}

export default ByjusComboBox
