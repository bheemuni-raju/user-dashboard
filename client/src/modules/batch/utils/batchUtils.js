const getFilterTypes = (type) => {
  const FILTERTYPES = [
    {
      label: 'NUMBER',
      value: 'NUMBER'
    },
    {
      label: 'STRING',
      value: 'STRING'
    },
    {
      label: 'DATE',
      value: 'DATE'
    },
    {
      label: 'SELECT',
      value: 'SELECT',
      hasOptions: true
    }
  ]

  if (type) {
    return FILTERTYPES.find(f => f.value === type);
  }

  return FILTERTYPES
}

const operatorsMap = {
  "NUMBER": [{
    label: 'Equal', value: 'is'
  }, {
    label: "Not Equal", value: "is_not"
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
    label: 'Is', value: 'is'
  }, {
    label: "Is Not", value: "is_not"
  }, {
    label: 'Contains', value: 'contains'
  }, {
    label: 'Does Not Contains', value: 'not_contains'
  },
  {
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
  "SELECT": [{
    label: 'In', value: 'in'
  }, {
    label: "Not In", value: "not_in"
  }],
  "DATE": [{
    label: 'After', value: 'greater_than_equal_to'
  }, {
    label: 'Before', value: 'less_than_equal_to'
  }, {
    label: 'Between', value: 'between'
  }]
}

function getOperators(dataType){
  let operators = [];

  if (dataType === "NUMBER") {
    operators = operatorsMap["NUMBER"];
  }
  else if (dataType === "TEXT" || dataType === "STRING") {
    operators = operatorsMap["STRING"];
  }
  else if (dataType === "SELECT") {
    operators = operatorsMap["SELECT"];
  }
  else if (dataType === "DATE") {
    operators = operatorsMap["DATE"];
  }

  return operators;
}

const CREATED_DATE_COLUMNS = ['createdAt','created_at'];

export {
  getFilterTypes, getOperators, CREATED_DATE_COLUMNS
}