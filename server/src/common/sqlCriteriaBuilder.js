const { isEmpty, isArray, snakeCase, compact } = require("lodash");
const moment = require("moment");
const { Op, where, cast, col } = require("sequelize");

const bunyan = require("../lib/bunyan-logger");
const logger = bunyan("sqlCriteriaBuilder");

const sqlCriteriaBuilder = ({ conditionType, searchBuilder }, contextCriterias, sort, simple = true, Model) => {
    const scQueries = queryBuilder(searchBuilder, sort, Model);
    const ccQueries = queryBuilder(contextCriterias, sort, Model);

    const rootQueries = [...scQueries.rootQueries, ...ccQueries.rootQueries];
    const associationQueries = [...scQueries.associationQueries, ...ccQueries.associationQueries];

    const sqlConditionType = conditionType === "$or" ? Op.or : Op.and;

    const dbCriterias = isEmpty(rootQueries) ? {} : { [sqlConditionType]: compact(rootQueries) };
    const rootQuery = { [Op.and]: [dbCriterias] };

    if (simple) return rootQuery;
    return { rootQuery, associationQuery: associationQueries };
};

const startsWithCapital = (word) => word.charAt(0) === word.charAt(0).toUpperCase();

const queryBuilder = (criterias = [], sort = {}, Model) => {
    const rootQueries = [];
    const associationQueries = [];
    criterias.forEach((filter) => {
        const { selectedColumn } = filter;
        const subQuery = buildSubQuery(filter);

        if (selectedColumn.includes(".")) {
            let queryObject = {};
            const [alias, column] = selectedColumn.split(".");
            const textCastedColumn = cast(col(snakeCase(column)), "text");

            if (startsWithCapital(alias)) {
                queryObject = {
                    model: db[alias],
                    where: where(textCastedColumn, subQuery),
                    required: true,
                };
            } else {
                queryObject = {
                    association: alias,
                    where: where(textCastedColumn, subQuery),
                    required: true,
                };
            }

            associationQueries.push(queryObject);
        } else {
            let textCastedColumn = cast(col(snakeCase(selectedColumn)), "text");
            if (Model) {
                textCastedColumn = cast(col(`${Model}.${snakeCase(selectedColumn)}`), "text");
            }
            rootQueries.push(where(textCastedColumn, subQuery));
        }
    });

    Object.keys(sort).forEach((key) => {
        if (key.includes(".")) {
            let queryObject = {};
            const [alias] = key.split(".");

            if (startsWithCapital(alias)) {
                queryObject = {
                    model: db[alias],
                    required: true,
                };
            } else {
                queryObject = {
                    association: alias,
                    required: true,
                };
            }

            associationQueries.push(queryObject);
        }
    });

    return { rootQueries, associationQueries };
};

const buildSubQuery = (filter) => {
    let { selectedOperator, selectedValue } = filter;

    let query = {};
    if (selectedOperator === "contains") {
        query = { [Op.iLike]: `%${typeof selectedValue === "object" ? selectedValue[0] : selectedValue}%` };
    } else if (selectedOperator === "starts_with") {
        query = { [Op.startsWith]: selectedValue };
    } else if (selectedOperator === "ends_with") {
        query = { [Op.endsWith]: selectedValue };
    } else if (selectedOperator === "not_equal") {
        query = { [Op.ne]: selectedValue };
    } else if (selectedOperator === "equal") {
        query = { [Op.iLike]: `%${typeof selectedValue === "object" ? selectedValue[0] : selectedValue}%` };
    } else if (selectedOperator === "exists") {
        query = { [Op.is]: selectedValue };
    } else if (selectedOperator === "not_exists") {
        query = { [Op.not]: selectedValue };
    } else if (selectedOperator === "greater_than") {
        query = { [Op.gt]: selectedValue };
    } else if (selectedOperator === "greater_than_equals_to") {
        query = { [Op.gte]: selectedValue };
    } else if (selectedOperator === "less_than") {
        query = { [Op.lt]: selectedValue };
    } else if (selectedOperator === "less_than_equals_to") {
        query = { [Op.lte]: selectedValue };
    } else if (selectedOperator === "in") {
        const val = buildInOperatorVal(selectedValue);
        query = { [Op.in]: val };
    } else if (selectedOperator === "not_in") {
        const val = buildInOperatorVal(selectedValue);
        query = { [Op.notIn]: val };
    } else if (selectedOperator === "not_contains") {
        query = { [Op.notILike]: `%${selectedValue}%` };
    } else if (selectedOperator === "after") {
        query = { [Op.gt]: moment(selectedValue, "YYYY-MM-DD").endOf("day").subtract(330, "minute").toDate() };
    } else if (selectedOperator === "before") {
        query = { [Op.lt]: moment(selectedValue, "YYYY-MM-DD").subtract(330, "minute").toDate() };
    } else if (selectedOperator === "between") {
        const splitedDate = selectedValue.split(" to ");
        if (
            moment(splitedDate[0], "YYYY-MM-DD").utc().diff(moment(splitedDate[1], "YYYY-MM-DD").utc(), "minutes") > 0
        ) {
            firstDate = moment(splitedDate[1], "YYYY-MM-DD").startOf("day").subtract(330, "minute").toDate();
            lastDate = moment(splitedDate[0], "YYYY-MM-DD").endOf("day").subtract(330, "minute").toDate();
        } else {
            firstDate = moment(splitedDate[0], "YYYY-MM-DD").startOf("day").subtract(330, "minute").toDate();
            lastDate = moment(splitedDate[1], "YYYY-MM-DD").endOf("day").subtract(330, "minute").toDate();
        }

        query = { [Op.gte]: firstDate, [Op.lte]: lastDate };
        logger.info("Advanse search query :", JSON.stringify(query));
    }

    return query;
};

const buildInOperatorVal = (val) => {
    let splitedVal = [];
    let valArray = [];

    if (isArray(val)) {
        splitedVal = val;
    } else if (val.indexOf(",") > -1) {
        valArray = val.split(",");
        valArray.map((vl) => {
            splitedVal.push(vl.trim());
        });
    } else if (val.indexOf("\n") > -1) {
        valArray = val.split("\n");
        valArray.map((vl) => {
            splitedVal.push(vl.trim());
        });
    } else {
        const trimVal = val.trim();
        splitedVal.push(trimVal);
    }
    return splitedVal;
};

const dbContextCriteriasHelper = (filter) => {
    if (filter.hasOwnProperty("conditionType")) {
        const conditions = filter.conditions.map((cond) => dbContextCriteriasHelper(cond));
        return { [filter.conditionType]: conditions };
    } else {
        return { [filter.selectedColumn]: buildSubQuery(filter) };
    }
};

module.exports = {
    sqlCriteriaBuilder
};