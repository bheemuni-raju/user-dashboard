import React, { useState, useRef, createRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { filter } from 'lodash';
import { FormBuilder } from 'components/form';

import { getOperators } from 'modules/batch/utils/batchUtils';

function ReportScheduleFilters({ columns }, ref) {

  const [filters, setFilters] = useState([]);
  const [count, setCount] = useState(0);
  const formRefs = useRef([]);

  useEffect(() => {
    const newFilters = filter(columns, {default: true}).map((column,index) => ({
      column: column.column,
      operator: column.operator,
      default: true,
      key: index+1
    }));

    setFilters(newFilters);
    setCount(newFilters.length);
  },[JSON.stringify(columns)]);

  useImperativeHandle(ref, () => ({
    validateFormAndGetValues() {
      const values = [];
      let isValid = true;

      formRefs.current.forEach(formRef => {
        const formValues = formRef.validateFormAndGetValues();

        if (!formValues) {
          isValid = false;
          return ;
        }

        let { dataType = '' } = columns.find(filter => formValues.column === filter.column) || {};
        dataType = dataType.toLowerCase();

        if (formValues.operator === 'between') {
          values.push(
            {
              name: formValues.column,
              operator: 'greater_than_equal_to',
              type: dataType,
              value: formValues.startValue
            },
            {
              name: formValues.column,
              operator: 'lesser_than_equal_to',
              type: dataType,
              value: formValues.endValue
            }
          );
        } else {
          values.push({
            name: formValues.column,
            operator: formValues.operator,
            type: dataType,
            value: formValues.value
          });
        }
      });

      if (isValid) return values;
      return null;
    }
  }));

  //reseting array of FormBulder refs
  formRefs.current = [];

  const addFilter = () => {
    const newCount = count + 1;
    const newFilters = [...filters, { key: newCount }];
    setFilters(newFilters);
    setCount(newCount);
  }

  const changeFilter = (index, value, name) => {
    const newFilters = [...filters];
    newFilters[index][name] = value;
    setFilters(newFilters);
  }

  const removeFilter = index => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  }

  const getColumnOptions = selectedValue => {
    return columns
    .filter(({ column }) => (selectedValue === column || !filters.some(filter => filter.column === column)))
    .map(({ column }) => ({ value: column, label: column.replace(/_/g, " ") }));
  }

  const buildFields = (filter, index) => {
    const {
      dataType:selectedColDataType = '',
      options:selectedColOptions=[]
    } = columns.find(f => filter.column === f.column) || {};
    
    const inputFields = [
      {
        type: "select",
        placeholder: 'Select Column',
        name: 'column',
        required: true,
        disabled: filter.default,
        options: getColumnOptions(filter.column),
        onChange: (value) => changeFilter(index, value, 'column')
      },
      {
        type: filter.default ? 'readonly' : "select",
        placeholder: 'Select Operator',
        name: 'operator',
        required: true,
        onChange: (value) => changeFilter(index, value, 'operator'),
        options: getOperators(selectedColDataType)
      }
    ];

    if (filter.operator === 'between') {
      inputFields.push({
        type: selectedColDataType.toLowerCase() || "text",
        placeholder: 'Start Value',
        name: 'startValue',
        required: true
      },
      {
        type: selectedColDataType.toLowerCase() || "text",
        placeholder: 'End Value',
        name: 'endValue',
        required: true
      });
    } else {
      selectedColDataType && inputFields.push({
        type: getInputFieldType(selectedColDataType),
        name: 'value',
        placeholder: 'Value',
        required: true,
        isMulti: true,
        options: selectedColOptions.map(o => ({value:o, label:o}))
      });
    }

    return inputFields;
  }

  return (
    <>
      {filters.map((filter, index) => (
        <Row key={filter.key}>
          <Col md="10">
            <FormBuilder
              ref={ref => ref && formRefs.current.push(ref)}
              initialValues={filter}
              fields={buildFields(filter, index)}
              cols={4}
            />
          </Col>
          {
            !filter.default && <Col md="2">
              <Button
                type="button"
                color="success"
                onClick={() => removeFilter(index)}
              >
                <i className="fa fa-minus" />
              </Button>
            </Col>
          }
        </Row>
      ))}
      {
        filters.length !== columns.length && <Row className="pb-3">
          <Col>
            <Button
              type="button"
              color="secondary"
              size="sm"
              onClick={addFilter}
            >
              <i className="fa fa-plus" /> Add filter
            </Button>
          </Col>
        </Row>
      }

    </>
  )
}


function getInputFieldType(dataType){
  dataType = dataType.toLowerCase();
  if(dataType === 'number' || dataType === 'string'){
    return 'text';
  }
  return dataType;
}

export default forwardRef(ReportScheduleFilters);