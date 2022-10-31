const { SecretPools, Environment, ApplicationType } = require('@byjus-orders/npgexemplum');
const { size, snakeCase } = require('lodash');

const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');

const listSecretPool = async (req, res) => {
    const { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    const sqlOrder = Object.keys(sort).map(item => {
        return [item, sort[item]];
    });
    try {
        const options = {
            page: page || 1,
            paginate: limit || 10,
            order: [['createdAt', 'DESC']],
            where: sqlFilter,
            include: [
                {
                    model: Environment,
                    as: 'Environment',
                    attribute: ['id']
                },
                {
                    model: ApplicationType,
                    as: 'ApplicationType',
                    attribute: ['id']
                }
            ]
        };

        let poolResults = await SecretPools.paginate(options);
        if (poolResults) {
            res.sendWithMetaData(poolResults);
        } else {
            res.send('No list is present');
        }
    } catch (error) {
        throw error;
    }
};

const getEncryptionKeyBySecretPoolId = async (id) => {
    try {
        let encryptKeyList = await SecretPools.findAll({ where: { id: id } });
        if (encryptKeyList) {
            return encryptKeyList;
        } else {
            return false;
        }
    } catch (error) {
        throw error
    }
};

const createSecretPool = async (req, res) => {
    const { id, description, isActive, createdBy, createdAt, applicationType, environment } = req.body;
    let { poolUuid } = req.body

    try {
        poolUuid = snakeCase(poolUuid);
        const checkPoolUuid = await SecretPools.count({
            attribute: ['poolUuid'],
            where: { poolUuid: poolUuid }
        });
        if (checkPoolUuid) {
            return res.status(403).json({ errorMessage: `sub vault ${poolUuid} is already exists ,Please use another sub vault uid` });
        }
        const insertData = await SecretPools.create({
            id,
            poolUuid,
            description,
            isActive,
            createdBy,
            createdAt,
            applicationType,
            environment,
            updatedBy: createdBy
        });
        if (insertData) {
            res.json(insertData);
        } else {
            res.send('No secretes are available');
        }
    } catch (error) {
        throw error;
    }
};

const updateSecretPool = async (req, res) => {
    const { id, description, updatedBy, updatedAt } = req.body;
    let { poolUuid } = req.body

    try {
        poolUuid = snakeCase(poolUuid);

        const updateData = await SecretPools.update({
            id,
            poolUuid,
            description,
            updatedBy,
            updatedAt
        }, { where: { id: id } });
        if (updateData) {
            res.json(updateData);
        } else {
            res.send('id does not match to update secret');
        }
    } catch (error) {
        throw error
    }
};

const deleteSecretPool = async (req, res) => {
    const { id, isActive } = req.body;
    try {
        const deleteData = await SecretPools.update({ isActive: isActive }, { where: { id: id } });
        if (deleteData) {
            res.json(deleteData);
        } else {
            res.send('Record not exists.');
        }
    } catch (error) {
        throw error;
    }
};


module.exports = {
    listSecretPool,
    createSecretPool,
    updateSecretPool,
    deleteSecretPool,
    getEncryptionKeyBySecretPoolId
};