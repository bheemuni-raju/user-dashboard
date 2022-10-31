const { size } = require('lodash');
const moment = require('moment');
const { DayOff } = require('@byjus-orders/nexemplum/scachieve');

const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { from, to } = req.query;

    const diff = moment(to).diff(from, 'days');
    let dateRange = [from];

    if (diff > 0) {
        for (let i = 1; i <= diff; i++) {
            dateRange.push(moment(from).add({ d: i }).format("YYYY-MM-DD"));
        }
    }
    console.log(dateRange);

    if (dateRange.length > 0) {
        filter["date"] = { "$in": dateRange };
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        const list = await DayOff.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

module.exports = {
    ...commonController,
    listData
}