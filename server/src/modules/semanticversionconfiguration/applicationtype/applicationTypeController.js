const { ApplicationType } = require('@byjus-orders/npgexemplum');
const { size, isEmpty } = require('lodash')
const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');


const applicationTypeList = async (req, res) => {

    const {
        page,
        limit,
        sort,
        filter = {},
        searchCriterias = [],
        contextCriterias = [],
      } = req.body;
      const sqlFilter =
        size(filter) === 0
          ? sqlCriteriaBuilder(searchCriterias, contextCriterias)
          : filter;
    
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

        const ApplicationTypeList = await ApplicationType.paginate(options);

        if (!ApplicationTypeList) return res.status(400).send('Failed to fetch application type list')

        res.sendWithMetaData(ApplicationTypeList);
    }
    catch (err) {
        res.status(400).json({ error: err.message, message: "Api failed" });
    }

};

const createApplicationType = async (req, res) => {
    const { name, formattedName, createdBy } = req.body;

    console.log('body ', name, formattedName, createdBy)
    if (!name || !formattedName || !createdBy) {
        return res.status(400).json({ 'message': 'All fields are required' });
    }

    try {
        const SemanticData = await ApplicationType.create({
            name,
            formattedName,
            isActive: 'true',
            createdBy
        });

        if (!SemanticData) return res.send('Failed to create application type')

        res.status(201).json(SemanticData);

    }
    catch (err) {
        res.status(400).json({ error: err.message, message: "api failed" });
    }
}

const updateApplicationType = async (req, res) => {
    const { name, formattedName, updatedBy } = req.body;
    const id = req.params.id;

    if (!name || !formattedName || !updatedBy) {
        return res.status(400).json({ 'message': 'All fields are required' });
    }

    try {
        const updateAppType = await ApplicationType.update({
            name,
            formattedName,
            updatedBy
        },
            {
                where: { id: id }
            });

        if (!updateAppType) return res.send('Failed to update application type')

        res.status(200).json(updateAppType);

    } catch (err) {
        res.status(400).json({ error: err.message, message: "Api failed" });
    }
};


const deleteApplicationType = async (req, res) => {

    const { id, isActive } = req.body;

    if (!id) return res.status(400).json({ 'message': 'id is required' })

    try {
        const deleteAppType = await ApplicationType.update({ isActive }, { where: { id: id } });

        if (!deleteAppType) return res.status(404).send('Record not exists with this id.');

        res.json(deleteAppType);

    } catch (err) {
        res.status(400).json({ error: err.message, message: "Api failed" });
    }
};


module.exports = {
    applicationTypeList,
    createApplicationType,
    updateApplicationType,
    deleteApplicationType
}