const db = require('@byjus-orders/npgexemplum');
const { isEmpty } = require('lodash');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

const pgListComboData = async (req, res) => {
    const { model, filter = {}, displayKey, valueKey,
        page, limit, sort, inputValue } = req.body;

    let pgFilter = filter;
    if (!isEmpty(inputValue)) {
        let extraFilter = {
            [displayKey]: {
                [Op.iRegexp]: '^' + inputValue
            }
        };
        pgFilter = pgFilter && Object.assign(pgFilter, extraFilter)
    }

    const options = {
        attributes: valueKey ? [displayKey, valueKey] : '',
        page: page || 1,
        paginate: limit || 25, // Default 25 records
        order: !isEmpty(sort) || [[displayKey, 'ASC']],
        where: pgFilter
    };

    const modelName = db[model];
    try {
        const list = await modelName.paginate(options);
        res.json(list.docs);
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    pgListComboData
};
