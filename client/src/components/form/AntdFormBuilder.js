import React, { Component, Fragment } from 'react';
import { isEqual, capitalize, cloneDeep, remove, isEmpty } from 'lodash';
import {
    Form, Input, Icon, InputNumber,
    DatePicker, Radio, Checkbox,
    Select,
    Switch, Cascader,
    Slider, Upload, Button, Row, Col,
    Tag, Tooltip
} from 'antd';
import { get } from 'lodash';

import './style.scss';

const { Item } = Form;
const { TextArea, Group, Password } = Input;
const { Group: RadioGroup, Button: RadioButton } = Radio;
const { Group: CheckboxGroup } = Checkbox;
const { Option: SelectOption } = Select;

class FormBuilder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: [],
            formValues: {}
        };
    }

    buildPasswordField = (field) => {
        const { name, placeholder = '',
            onChange, allowClear = true,
            size = 'default',
            prefix = '', suffix = '', disabled = false } = field;

        return (
            <Password
                id={name}
                name={name}
                size={size}
                allowClear={allowClear}
                prefix={prefix}
                suffix={suffix}
                placeholder={placeholder}
                onChange={(e) => this.handleFieldChanges(e, onChange)}
                disabled={disabled} />
        )
    }

    buildInputField = (field) => {
        const { type, name, placeholder = '',
            onChange, allowClear = true,
            size = 'default',
            prefix = '', suffix = '', disabled = false } = field;

        return (
            <Input
                {...field}
                id={name}
                name={name}
                type={type}
                size={size}
                allowClear={allowClear}
                prefix={prefix}
                suffix={suffix}
                placeholder={placeholder}
                onChange={(e) => this.handleFieldChanges(e, onChange)}
                disabled={disabled}
            />
        )

    }

    buildTextareaField = (field) => {
        const { placeholder = '', autosize = { minRows: 2 }, onChange } = field;

        return (
            <TextArea
                {...field}
                placeholder={placeholder}
                autosize={autosize}
                onChange={(e) => this.handleFieldChanges(e, onChange)}
            />
        )
    }

    buildNumberField = (field) => {
        const { min, max, name,
            step = 1, size = 'default',
            onChange,
            formatter, parser, style = { width: '100%' } } = field;

        delete field.value;

        return (
            <InputNumber
                {...field}
                style={style}
                min={min}
                max={max}
                formatter={formatter}
                parser={parser}
                size={size}
                step={step}
                onChange={(val) => this.handleNumberChanges(val, name, onChange)}
            />
        )
    }

    buildDatePicker = (field) => {
        const { size = 'default',
            format = "DD-MM-YYYY",
            disabledDate } = field;

        return (
            <DatePicker
                size={size}
                format={format}
                disabledDate={disabledDate}
                onChange={this.handleFieldChanges}
            />
        )
    }

    buildInputGroup = (field) => {
        const { items,
            rowType = 'flex',
            size = 'default', gutter = 16 } = field;

        const { getFieldDecorator } = this.props.form;

        return (
            <Row rowtype={rowType} gutter={gutter} span={24}>
                <Group size={size}>
                    {
                        items.map((item, idx) => {
                            let { tooltip, name, label, value, message, required, rules = [], span } = item;
                            delete (item.value);
                            const requiredMsg = label || capitalize(name);
                            const allRules = [
                                ...rules,
                                { required: required, message: message || `Please enter ${requiredMsg}.` }
                            ];
                            span = span || Math.floor(24 / items.length);
                            return (
                                <Col key={idx} span={span}>
                                    <Item>
                                        {getFieldDecorator(name, {
                                            rules: allRules,
                                            validateTrigger: 'onBlur',
                                            initialValue: value || ""
                                        })(
                                            tooltip ?
                                                <Tooltip placement="topLeft" title={tooltip}>{this.buildFormField(item)}</Tooltip> :
                                                this.buildFormField(item)
                                        )}
                                    </Item>
                                </Col>
                            )
                        })
                    }
                </Group >
            </Row>
        )

    }

    buildRadioField = (field) => {
        const { options, btnOptions, viewType = 'default',
            size = 'default', onChange,
            buttonStyle = 'outline' } = field;

        return (viewType === 'button' ?
            <RadioGroup
                buttonStyle={buttonStyle}
                size={size}
                onChange={(e) => { this.handleSelectChanges(e, onChange) }}
            >
                {
                    btnOptions.map((option, idx) => {
                        return (
                            <RadioButton
                                key={idx}
                                value={get(option, 'value')}
                            >
                                {get(option, 'label')}
                            </RadioButton>
                        )
                    })
                }
            </RadioGroup> :
            <RadioGroup size={size}
                options={options}
                onChange={(e) => { this.handleSelectChanges(e, onChange) }}
                {...field}
            />
        );
    }

    buildCheckboxField = (field) => {
        const { disabled,
            options, size = 'default',
            value, onChange, checkBoxLabel } = field;

        return (
            options ?
                <CheckboxGroup
                    {...field}
                    options={options}
                    value={value}
                    onChange={(e) => { this.handleCheckBoxChanges(e, onChange) }}
                    size={size}
                /> :
                <Checkbox
                    {...field}
                    disabled={disabled}
                    size={size}
                    onChange={(e) => { this.handleCheckBoxChanges(e, onChange) }}
                >{checkBoxLabel}
                </Checkbox>
        );
    }

    buildSelectField = (field) => {
        const { name, size = 'default',
            options = [],
            onChange,
            loading = false,
            mode, filterOption } = field;

        return (
            <Select
                {...field}
                showSearch={true}
                size={size}
                name={name}
                mode={mode}
                loading={loading}
                onChange={(selectedValue, option) => {
                    const optionProp = get(option, 'props');
                    const selectedOption = {
                        label: get(optionProp, 'children'),
                        value: get(optionProp, 'value')
                    }
                    this.handleSelectChanges(selectedValue, name, selectedOption, onChange)
                }}
                filterOption={filterOption || ((input, option) => {
                    const formatOption = option.props.children.toString();
                    return formatOption.toLowerCase().indexOf(input.toLowerCase()) >= 0
                })}
                allowClear={true}
            >
                {options && options.map((option, idx) => {
                    const { label, value } = option;
                    return (
                        <SelectOption key={idx} value={value} >
                            {label}
                        </SelectOption>
                    );
                })}
            </Select>
        )
    }

    buildReadOnlyField = (field) => {
        const { value } = field;

        return <p>{value}</p>;
    }

    buildCascaderField = (field) => {
        /**
         * options:[{
         * labe:"",
         * value:"",
         * children:[{}]}]
         */
        const { options, onChange, children,
            expandTrigger, displayRender, changeOnSelect = true } = field;

        return (
            <Cascader
                options={options}
                onChange={onChange}
                expandTrigger={expandTrigger}
                displayRender={displayRender}
                changeOnSelect={changeOnSelect}
                {...field}
            >{children}
            </Cascader>
        );
    }

    buildUploadField = (field) => {
        return (
            <Upload
                {...field}
            >
                <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">Upload</div>
                </div>
            </Upload >
        )
    }

    buildToggleSwitch = (field) => {
        const { defaultChecked = false, checkedChildren, unCheckedChildren,
            loading = false, size = 'default' } = field;

        return (
            <Switch
                checkedChildren={checkedChildren}
                unCheckedChildren={unCheckedChildren}
                defaultChecked={defaultChecked}
                loading={loading}
                size={size}
            />
        );
    }

    buildSlider = (field) => {
        const { min, max, range = false, step = 10,
            onChange, onAfterChange } = field;

        return (
            <Slider
                range={range}
                step={step}
                min={min}
                max={max}
                onChange={onChange}
                onAfterChange={onAfterChange} />
        );
    }

    buildButtonField = (field) => {
        const { btntype, text, loading = false } = field;

        return (
            <Button
                {...field}
                type={btntype}
                loading={loading}
            >
                {text}
            </Button>
        )
    }

    buildTagField = (field) => {
        const { color = "purple", text } = field;

        return (
            <Tag
                {...field}
                color={color}
            >
                {text}
            </Tag>);
    }

    buildFormField = (field) => {
        const { type } = field;

        switch (type) {
            case 'text':
            case 'email':
            case 'hidden': return this.buildInputField(field);
            case 'password': return this.buildPasswordField(field);

            case 'readonly': return this.buildReadOnlyField(field);
            case 'textarea': return this.buildTextareaField(field);
            case 'number': return this.buildNumberField(field);
            case 'datepicker': return this.buildDatePicker(field);
            case 'inputgroup': return this.buildInputGroup(field);
            case 'radio': return this.buildRadioField(field);
            case 'checkbox': return this.buildCheckboxField(field);
            case 'select': return this.buildSelectField(field);
            case 'cascader': return this.buildCascaderField(field);
            case 'upload': return this.buildUploadField(field);
            case 'switch': return this.buildToggleSwitch(field);
            case 'slider': return this.buildSlider(field);
            case 'button': return this.buildButtonField(field);
            case 'tag': return this.buildTagField(field);
            default: return <Fragment />;
        }
    }

    renderLabel = (field) => {
        const { label } = field;

        if (label) {
            return (
                <Fragment>
                    <p className='form-field-label'>{`${label} `}</p>
                </Fragment>
            )
        }
    }

    handleFieldChanges = (e, passedOnChange) => {
        const { form } = this.props;
        const { name, value } = e && get(e, 'target', {});

        /**If own onChange function is passed, then execute that also */
        passedOnChange && passedOnChange(value, name);
        //form.setFieldsValue({ [name]: value });
    }

    handleNumberChanges = (value, name, passedOnChange) => {
        const { form } = this.props;

        /**If own onChange function is passed, then execute that also */
        passedOnChange && passedOnChange(value, name);
        //form.setFieldsValue({ [name]: value });
    }

    handleSelectChanges = (name, selectedValue, selectedOption, passedOnChange) => {
        const { form } = this.props;

        /**If own onChange function is passed, then execute that also */
        passedOnChange && passedOnChange(name, selectedValue, selectedOption);
        //form.setFieldsValue({ [name]: selectedValue });
    }

    handleCheckBoxChanges = (e, passedOnChange) => {
        const { form } = this.props;
        const { name, checked } = e && get(e, 'target', {});

        //form.setFieldsValue({ [name]: checked });
        /**If own onChange function is passed, then execute that also */
        passedOnChange && passedOnChange(checked, name);
    }

    /**Setting initial values for the form */
    setFormValues = () => {
        const { fields, initialValues = {} } = this.state;
        const { form } = this.props;
        const formValues = form.getFieldsValue();

        fields.map((field) => {
            const { name, value } = field;
            formValues[name] = initialValues && initialValues.hasOwnProperty(name) ? initialValues[name] : (formValues[name] || value);
        });

        form.setFieldsValue(formValues);
    }

    getFormValues = async () => {
        const { form } = this.props;

        let result = null;
        return new Promise((resolve, reject) => {
            form.validateFieldsAndScroll((err, values = {}) => {
                Object.keys(values).map((key) => {
                    values[key] = (values[key] && values[key].trim) ? values[key].trim() : values[key]
                });

                if (!err) {
                    result = values;
                }
            });
            return resolve(result);
        });
    }

    getFieldsValue = () => {
        const { form } = this.props;

        let values = form ? form.getFieldsValue() : {};

        /**To take only valid values */
        Object.keys(values).map(key => {
            if (!values[key]) {
                delete values[key];
            }
        });

        return values;
    }

    setFieldsValue = (values) => {
        const { form } = this.props;

        return form && form.setFieldsValue(values);
    }

    resetFields = (fields) => {
        const { form } = this.props;

        return form && form.resetFields(fields);
    }

    componentWillReceiveProps = (nextProps, nextState) => {
        const { fields, initialValues } = this.state;

        if (!isEqual(fields, nextProps.fields)) {
            const newFields = nextProps.fields;
            /**Removing empty or null fields */
            remove(newFields, (f) => !f || isEmpty(f));

            this.setState({
                fields: newFields
            }, () => {
                // this.setFormValues()
            })
        }
        if (!isEqual(initialValues, nextProps.initialValues)) {
            this.setState({
                initialValues: nextProps.initialValues
            }, () => {
                this.setFormValues()
            })
        }
    }

    componentDidMount = () => {
        const { fields } = this.props;

        /**Removing empty or null fields */
        remove(fields, (f) => !f || isEmpty(f));

        this.setState({ fields }, () => {
            this.setFormValues(fields);
        });
    }

    renderFormComponent = () => {
        const defaultFormItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 24 },
                lg: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
                lg: { span: 10 },
            },
        };

        const defaultTailFormItemLayout = {
            /*wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0
                },
                sm: {
                    span: 16,
                    offset: 0
                },
            },*/
        };

        const { fields = [] } = this.state;
        const clonedFieldsArray = cloneDeep(fields) || [];
        const {
            layout = 'inline',
            formItemLayout = defaultFormItemLayout,
            tailFormItemLayout = defaultTailFormItemLayout,
            initialValues
        } = this.props;
        const { getFieldDecorator } = this.props.form;

        //const formBorderClass = isBordered ? 'form-border' : '';
        return (
            <Form layout={layout} {...formItemLayout} colon={true}>
                {
                    clonedFieldsArray && clonedFieldsArray.map((field, idx) => {
                        const { type, style, name, label, labelColon = true, value, required, message, rules = [],
                            tooltip, helpText } = field;
                        const helpTextMessage = helpText;

                        /**Delete helpText prop as it throws a warning to be passed in lowercase */
                        field["helptext"] = helpText;
                        delete (field.helpText);

                        /**Delete default value as it causes issue with field decorators, setting initial value via setFieldsValue */
                        delete (field.value);
                        delete (field.helpText);
                        const requiredMsg = label || capitalize(name);
                        const allRules = [
                            ...rules,
                            { required: required, message: message || `Please enter ${requiredMsg}.` }
                        ];
                        const fieldStyle = (type === "hidden") ? { display: 'none' } : style;
                        const formattedLabel = label ? `${label} ${labelColon ? ':' : ''} ` : '';
                        return (
                            <Item
                                key={idx}
                                label={formattedLabel}
                                {...tailFormItemLayout}
                                style={fieldStyle}
                                extra={helpTextMessage}
                            >
                                {getFieldDecorator(name, {
                                    rules: allRules,
                                    validateTrigger: 'onBlur',
                                    initialValue: initialValues && initialValues[name]
                                })(
                                    tooltip
                                        ? <Tooltip title={tooltip}>{this.buildFormField(field)}</Tooltip>
                                        : this.buildFormField(field)
                                )}

                            </Item>
                        )
                    })
                }
            </ Form>
        )
    }

    render = () => {
        const {
            heading,
            className,
            headerClasses = "bg-primary text-white",
            isBordered = false
        } = this.props;
        return (
            <div className={`card ${isBordered ? '' : 'border-0'} ${className}`} style={{ margin: 10 }}>
                {heading && <div className={`card-header ${headerClasses}`}>
                    {heading}
                </div>}
                <div className="card-body">
                    {this.renderFormComponent()}
                </div>
            </div>
        )
    }
}

const WrappedFormBuilder = Form.create({
    /**Function to track change in field values */
    onValuesChange: (props, changedValue, allFieldsValues) => {
        const { onValuesChange } = props;
        onValuesChange && onValuesChange(changedValue, allFieldsValues);
    },
    /**Function to track change in field attribures */
    onFieldsChange: (props, changedField, allFields) => {
        const { onFieldsChange } = props;
        onFieldsChange && onFieldsChange(changedField, allFields);
    }
})(FormBuilder);

export default WrappedFormBuilder;
