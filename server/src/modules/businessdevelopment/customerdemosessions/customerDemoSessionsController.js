const { size } = require('lodash');
const { CustomerDemoSession } = require('@byjus-orders/nexemplum/ums');

const { criteriaBuilder } = require('../../../common/criteriaBuilder');

const listData = async (req, res) => {
    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    const { date,reportingManagerEmailId } = req.query;

    if (date) {
        filter["date"] = date;
    }

    if(reportingManagerEmailId){
        filter["reportingManagerEmailId"] =reportingManagerEmailId;
    }

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }
        const list = await CustomerDemoSession.paginate(filter, options);
        res.json(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

module.exports = {
    listData
}