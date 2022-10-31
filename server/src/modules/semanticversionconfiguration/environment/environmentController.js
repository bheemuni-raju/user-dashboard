const { Environment } = require('@byjus-orders/npgexemplum');
const { size, isEmpty } = require('lodash')
const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');


const enviornmentList = async (req, res) => {

        const { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
        const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;
        let sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);

    try {
        if (isEmpty(sqlOrder)) {
            sqlOrder = [["createdAt", "DESC"]];
          }
      
          const options = {
            page: page || 1,
            paginate: limit || 10,
            order: sqlOrder,
            where: sqlFilter,
          };
        const environmentList = await Environment.paginate(options);

        if (!environmentList) return res.status(400).send('Failed to fetch application type list')

        res.sendWithMetaData(environmentList);
    }
    catch (err) {
        res.status(400).json({ error: err.message, message: "Api failed" });
    }

};

const createEnviornment = async (req, res) => {
    const { name, formattedName, createdBy } = req.body;

    if (!name || !formattedName || !createdBy) {
        return res.status(400).json({ 'message': 'All fields are required' });
    }

    try {
        const EnvironmentData = await Environment.create({
            name,
            formattedName,
            isActive: 'true',
            createdBy
        });

        if (!EnvironmentData) return res.send('Failed to create application type')

        res.status(201).json(EnvironmentData);

    }
    catch (err) {
        res.status(400).json({ error: err.message, message: "api failed" });
    }
}

const updateEnvironment = async (req, res) => {
    const { name, formattedName, updatedBy } = req.body;
    const id = req.params.id;

    if (!name || !formattedName || !updatedBy) {
        return res.status(400).json({ 'message': 'All fields are required' });
    }

    try {
        const updateEnv = await Environment.update({
            name,
            formattedName,
            updatedBy
        },
            {
                where: { id: id }
            });

        if (!updateEnv) return res.send('Failed to update application type')

        res.status(200).json(updateEnv);

    } catch (err) {
        res.status(400).json({ error: err.message, message: "Api failed" });
    }
};


const deleteEnvironment = async (req, res) => {

    const { id, isActive } = req.body;

    if (!id) return res.status(400).json({ 'message': 'id is required' })

    try {
        const deleteEnv = await Environment.update({ isActive }, { where: { id: id } });

        if (!deleteEnv) return res.status(404).send('Record not exists with this id.');

        res.json(deleteEnv);

    } catch (err) {
        res.status(400).json({ error: err.message, message: "Api failed" });
    }
};


module.exports = {
    enviornmentList,
    createEnviornment,
    updateEnvironment,
    deleteEnvironment
}