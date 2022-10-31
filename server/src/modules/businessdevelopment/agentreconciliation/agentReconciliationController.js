const { size } = require('lodash');
const moment = require('moment');

const { EmployeeHistory } = require('@byjus-orders/nexemplum/achieve');

const { getAggregateStages } = require('./agentReconciliationAggregateStages');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');

const getReconciliationList = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;

    const { date } = req.query;
    const nextDate = new Date(date);

    contextCriterias.push({
        selectedColumn: "reconciledAt",
        selectedOperator: "greater_than_equals_to",
        selectedValue: new Date(nextDate)
    },{
        selectedColumn: "reconciledAt",
        selectedOperator: "less_than",
        selectedValue: new Date(moment(nextDate, "DD-MM-YYYY").add(1, 'days'))
    });

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        const list = await EmployeeHistory.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const getReconciliationSummary = async (req, res) => {
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;

    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

    try {
        if (sort && Object.keys(sort).length === 0) {
            sort = {
                _id: -1
            };
        }

        const options = {
            page: page || 1,
            limit: limit || 10,
            sortBy: sort
        };

        let summaryList = [];
        let stages = [];

        stages = await getAggregateStages();
        const aggregate = EmployeeHistory.aggregate(stages);
        summaryList = await EmployeeHistory.aggregatePaginate(aggregate, options);

        //Transform the api response to fit byjusGrid react component
        res.json({
            docs: summaryList.data,
            total: summaryList.totalCount,
            pages: summaryList.pageCount,
            limit,
            page
        });
    }
    catch (error) {
        throw new Error(error || 'Error in fetching data');
    }
}

module.exports = {
    getReconciliationList,
    getReconciliationSummary
}