const { isEmpty, isArray } = require('lodash');
const moment = require("moment");

/**
 * Checks for the special characters
 * @param val
 */
const buildInOperatorVal = (val) => {
  let splitedVal = []
  let valArray = []
  if (isArray(val)) {
    splitedVal = val;
  }
  else if (val && val.indexOf(',') > -1) {
    valArray = val.split(',')
    valArray.map((vl) => {
      splitedVal.push(vl.trim())
    })
  } else if (val && val.indexOf('\n') > -1) {
    valArray = val.split('\n')
    valArray.map((vl) => {
      splitedVal.push(vl.trim())
    })
  } else {
    const trimVal = val.trim()
    splitedVal.push(trimVal)
  }
  return splitedVal
}

/**
 * Builds query operator
 * @param filter
 */
const buildSubQuery = (filter) => {
  let { selectedOperator, selectedValue, selectedColumn } = filter;
  let firstDate = ''
  let lastDate = ''

  // /**Handling date cases */
  // if (["after", "before"].includes(selectedOperator)) {
  //   selectedValue = moment(selectedValue).format()
  // } else if (selectedOperator === 'between') {
  //   const splitedDate = selectedValue.split('to')
  //   firstDate = moment(splitedDate[0]).format()
  //   lastDate = moment(splitedDate[1]).format()
  // } else if (selectedColumn === 'createdAt' && selectedOperator === 'equal') {
  //   selectedValue = moment(selectedValue).format()
  // }
  // //This condition is for collection dashboard. Do not remove until all date issues fixed
  // else if (["lt", "gt"].includes(selectedOperator)) {
  //   selectedValue = selectedValue
  // }

  let query = {};
  if (selectedOperator === "contains") {
    query = {
      $regex: `${selectedValue}`,
      $options: "i"
    };
  } else if (selectedOperator === "starts_with") {
    query = new RegExp(`^${selectedValue}`, "i")
  } else if (selectedOperator === "ends_with") {
    query = new RegExp(`${selectedValue}$`, "i")
  }
  else if (selectedOperator === "not_equal") {
    query = { $ne: selectedValue };
  } else if (selectedOperator === "equal") {
    query = selectedValue;
  } else if (selectedOperator === "exists") {
    query = { $exists: true }
  } else if (selectedOperator === "not_exists") {
    query = { $exists: false }
  } else if (selectedOperator === "greater_than") {
    query = { $gt: selectedValue }
  } else if (selectedOperator === "greater_than_equals_to") {
    query = { $gte: selectedValue }
  } else if (selectedOperator === "less_than") {
    query = { $lt: selectedValue }
  } else if (selectedOperator === "less_than_equals_to") {
    query = { $lte: selectedValue }
  } else if (selectedOperator === 'in') {
    const val = buildInOperatorVal(selectedValue)
    query = { $in: val }
  } else if (selectedOperator === 'not_in') {
    const val = buildInOperatorVal(selectedValue)
    query = { $nin: val }
  } else if (selectedOperator === 'not_contains') {
    const regexValue = new RegExp(selectedValue, "i");
    query = { $not: regexValue }
  } else if (selectedOperator === "after") {
    //query = { $gt: new Date(moment(selectedValue).format('YYYY-MM-DDT23:59:59.000Z')) }
    query = { $gt: moment(selectedValue, "YYYY-MM-DD").endOf('day').subtract(330, 'minute').toDate() }
  } else if (selectedOperator === "before") {
    query = { $lt: moment(selectedValue, "YYYY-MM-DD").subtract(330, 'minute').toDate() }
  } else if (selectedOperator === 'between') {
    const splitedDate = selectedValue.split('to')
    if ((moment(splitedDate[0], 'YYYY-MM-DD').utc()).diff((moment(splitedDate[1], 'YYYY-MM-DD').utc()), 'minutes') > 0) {
      //firstDate = new Date(moment(splitedDate[1]).format('YYYY-MM-DDT00:00:00.000Z'));
      firstDate = moment(splitedDate[1], "YYYY-MM-DD").startOf('day').subtract(330, 'minute').toDate();
      //lastDate = new Date(moment(splitedDate[0]).format('YYYY-MM-DDT23:59:59.000Z'));
      lastDate = moment(splitedDate[0], "YYYY-MM-DD").endOf('day').subtract(330, 'minute').toDate();
    }
    else {
      //firstDate = new Date(moment(splitedDate[0]).format('YYYY-MM-DDT00:00:00.000Z'));
      firstDate = moment(splitedDate[0], "YYYY-MM-DD").startOf('day').subtract(330, 'minute').toDate();
      //lastDate = new Date(moment(splitedDate[1]).format('YYYY-MM-DDT23:59:59.000Z'));
      lastDate = moment(splitedDate[1], "YYYY-MM-DD").endOf('day').subtract(330, 'minute').toDate();
    }

    query = { $gte: firstDate, $lte: lastDate }
    console.log("Advanse search query :", JSON.stringify(query))
  }
  //This condition is for collection dashboard. Do not remove until all date issues fixed
  // else if (selectedOperator === 'gt') {
  //   query = { $gt: selectedValue }
  // } else if (selectedOperator === 'lt') {
  //   query = { $lt: selectedValue }
  // }

  return query;
}

/** Recursive function to handle any level of inner conditions */
const dbContextCriteriasHelper = (filter) => {
  if (filter.hasOwnProperty("conditionType")) {
    const conditions = filter.conditions.map(cond => dbContextCriteriasHelper(cond));
    return { [filter.conditionType]: conditions };
  } else {
    return { [filter.selectedColumn]: buildSubQuery(filter) };
  }
}

/**
 * Helper for building human queries to mongodb queries
 * @param {*} filters
 * @param {*} condition
 */
const criteriaBuilder = ({ conditionType, searchBuilder }, contextCriterias) => {
  let dbQuery = {}
  const dbSearchCriterias = searchBuilder ? searchBuilder.map(filter => ({
    [filter.selectedColumn]: buildSubQuery(filter)
  })) : [];

  const dbContextCriterias = contextCriterias ? contextCriterias.map(filter => dbContextCriteriasHelper(filter)) : [];

  /*
   Always add $and condition for nesting queries
   https://stackoverflow.com/questions/21274306/mongoose-how-to-do-a-find-with-two-or-conditions
  */
  const sCriterias = isEmpty(dbSearchCriterias) ? {} : { [conditionType]: dbSearchCriterias };
  const cCriterias = isEmpty(dbContextCriterias) ? {} : { $and: dbContextCriterias };

  if (conditionType === '$or') {
    dbQuery = {
      $and: [{
        ...cCriterias,
        ...sCriterias
      }]
    }
  } else {
    /** In case of $and condition a single object - combination of search and context criteria should be passed*/
    const query = []
    dbSearchCriterias.map((q) => {
      query.push(q)
    });

    dbContextCriterias.map((q) => {
      query.push(q)
    });

    dbQuery = {
      $and: query.length ? query : [{}]
    }
  }
  return dbQuery;
}

module.exports = {
  criteriaBuilder
};
