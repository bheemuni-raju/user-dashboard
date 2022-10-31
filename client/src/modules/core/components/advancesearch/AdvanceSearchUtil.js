import { get } from 'lodash';

const operatorsMap = {
  "NUMBER": [{
    label: 'Equal', value: 'equal'
  }, {
    label: "Not Equal", value: "not_equal"
  }, {
    label: 'Greater Than', value: 'greater_than'
  }, {
    label: 'Greater Than Equals To', value: 'greater_than_equals_to'
  }, {
    label: 'Less Than', value: 'less_than'
  }, {
    label: 'Less Than Equals To', value: 'less_than_equals_to'
  }],
  "STRING": [{
    label: 'Is', value: 'equal'
  }, {
    label: "Is Not", value: "not_equal"
  }, {
    label: 'Contains', value: 'contains'
  }, {
    label: 'Does Not Contains', value: 'not_contains'
  }, {
    label: 'In', value: 'in'
  }, {
    label: 'Starts With', value: 'starts_with'
  }, {
    label: 'Ends With', value: 'ends_with'
  }, {
    label: 'Exists', value: 'exists'
  }, {
    label: 'Not Exists', value: 'not_exists'
  }],
  "BOOLEAN": [{
    label: 'Is', value: 'equal'
  }, {
    label: "Is Not", value: "not_equal"
  }],
  "DATE": [{
    label: 'After', value: 'after'
  }, {
    label: 'Before', value: 'before'
  }, {
    label: 'Between', value: 'between'
  }]
}

const addOperators = (columns) => {
  const modifiedColumns = columns.map(column => {
    let operators = [];
    let columnType = get(column, 'type', 'text');
    let bFilter = columnType.toUpperCase();

    //Todo: Column type need to be passed for date columns
    const isTimestampColumn = ["createdAt", "updatedAt"].indexOf(column.dataField) >= 0;
    if (isTimestampColumn) {
      bFilter = "DATE";
      column.type = "date";
    }

    if (bFilter === "NUMBER") {
      operators = operatorsMap["NUMBER"];
    }
    else if (bFilter === "TEXT" || bFilter === "STRING") {
      operators = operatorsMap["STRING"];
    }
    else if (bFilter === "BOOLEAN" || bFilter === "SELECT") {
      operators = operatorsMap["BOOLEAN"];
    }
    else if (bFilter === "DATE") {
      operators = operatorsMap["DATE"];
    }

    return {
      dataField: column.datafield || column.dataField,
      label: column.text || column.text,
      operators: operators,
      text: column.text || column.text,
      type: column.type || 'text',
      value: column.text || column.text,
      options: column.options || []
    }
  });

  return modifiedColumns
}

export {
  addOperators,
  operatorsMap
}
