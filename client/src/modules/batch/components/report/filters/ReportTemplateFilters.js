import React, { useState, useRef, createRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { FormBuilder } from 'components/form';

import { getFilterTypes } from 'modules/batch/utils/batchUtils';

const FILTERTYPES = getFilterTypes();

function ReportTemplateFilters({ columns, initialValues }, ref) {
  const [filters, setFilters] = useState([]);
  const [count, setCount] = useState(0);
  const formRefs = useRef([]);

  useEffect(() => {
    if(initialValues){
      const initialFilters = initialValues.map((values,index) => ({ 
        ...values,
        options: values.options.join(),
        key: index + 1
      }));
      setFilters(initialFilters);
      setCount(initialValues.length);
    }
  },[JSON.stringify(initialValues)]);

  useImperativeHandle(ref, () => ({
    validateFormAndGetValues(){
      const values = [];
      let isValid = true;
      
      formRefs.current.forEach(formRef => {
        console.log(formRef, formRef.validateFormAndGetValues())
        let formValues = formRef.validateFormAndGetValues();
        if (!formValues) {
          isValid = false;
        }
        else {
          let value = {...formValues, options : formValues.options ? formValues.options.split(',') : []}
          values.push(value);
        }
      });
      
      if(isValid) return values;     
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
    .filter(({ key }) => (selectedValue === key || !filters.some(filter => filter.column === key)))
    .map(({ key, title }) => ({ label: title, value: key, disabled: true }));
  }

  const buildFields = (filter, index) => {
    return [
      {
        type: "select",
        placeholder: "Select Column",
        name: "column",
        required: true,
        options: getColumnOptions(filter.column),
        onChange: (value) => changeFilter(index, value, 'column')
      },
      {
        type: "select",
        placeholder: "Select Type",
        name: "dataType",
        required: true,
        options: FILTERTYPES,
        onChange: (value) => changeFilter(index, value, 'dataType')
      },
      {
        ...(
          (getFilterTypes(filter.dataType) && getFilterTypes(filter.dataType).hasOptions)
            ? {
              type: "textarea",
              placeholder: "eg: OPTION1,OPTION2,OPTION3,...",
              name: "options",
              required: true
            }
            : { type: "default" }
        )
      }
    ]
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
              // validationErrors={filtersErrors}
              cols={4}
            />
          </Col>
          <Col md="2">
            <Button
              type="button"
              color="success"
              onClick={() => removeFilter(index)}
            >
              <i className="fa fa-minus" />
            </Button>
          </Col>
        </Row>
      ))}
      {
        filters.length !== columns.length && <Row className="pt-2">
          <Col>
            <Button
              type="button"
              color="success"
              onClick={addFilter}
            >
              <i className="fa fa-plus" />
            </Button>
          </Col>
        </Row>
      }
    </>
  )
}


export default forwardRef(ReportTemplateFilters);