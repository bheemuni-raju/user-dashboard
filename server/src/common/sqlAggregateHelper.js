const { get } = require('lodash');
const sequelize = require('sequelize');

const aggregatePaginate = async ({ options, model }) => {
    const { page, limit, group } = options;
    const primaryGroupKey = group && group[0];
    const offset = page === 1 ? 0 : (page - 1) * limit;
    const docs = await model.findAll({
        ...options,
        offset,
        raw: true
    });

    const countResult = await model.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col(primaryGroupKey))), 'count']
        ],
        where: options.where,
        plain: true,
        raw: true
    });
    const totalRecords = parseInt(get(countResult, 'count'));

    return {
        docs,
        total: totalRecords,
        pages: Math.ceil(Number(totalRecords) / limit)
    }
}

module.exports = {
    aggregatePaginate
}