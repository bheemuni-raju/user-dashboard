const { VaultSecretPoolMapping, SecretPools } = require('@byjus-orders/npgexemplum');
const { size, isEmpty } = require('lodash');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');

const vaultMappingList = async (req, res) => {
    /**params request from a body */
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    if (!isEmpty(searchCriterias)) {
        const optionsForSecretPool = {
            page: page || 1,
            paginate: limit || 10,
            where: { poolUuid: { [Op.in]: searchCriterias.searchBuilder[0].selectedValue } },
            sort
        };

        const getPoolId = await SecretPools.paginate(optionsForSecretPool);
        if (isEmpty(getPoolId.docs)) {
            return res.sendWithMetaData(getPoolId);
        }

        const poolIds = [];
        getPoolId.docs.map(poolId => {
            poolIds.push(poolId.id)
        })

        const optionForVaultSecretPool = {
            page: page || 1,
            paginate: limit || 10,
            where: { secretPoolId: { [Op.in]: poolIds }, vaultId: contextCriterias[0].selectedValue },
            sort,
            include: [{
                model: SecretPools,
                as: 'secretPool',
                attribute: ['id']
            }]
        };
        const vaultMappingList = await VaultSecretPoolMapping.paginate(optionForVaultSecretPool);
        return res.sendWithMetaData(vaultMappingList);

    }
    const options = {
        page: page || 1,
        paginate: limit || 10,
        where: filter,
        sort,
        include: [{
            model: SecretPools,
            as: 'secretPool',
            attribute: ['id']
        }]
    };
    try {

        const vaultMappingList = await VaultSecretPoolMapping.paginate(options);

        res.sendWithMetaData(vaultMappingList);
    } catch (error) {
        throw error;
    }
};

const createMapping = async (req, res) => {
    let { secretPoolId, vaultId, createdBy } = req.body;
    //const options=mappingData;
    try {
        const checkSecretPoolMapping = await VaultSecretPoolMapping.count({
            attribute: ['vaultId'],
            where: { vaultId: vaultId, secretPoolId: secretPoolId }
        });
        if (checkSecretPoolMapping) {
            const poolUuid = await SecretPools.findOne({
                attribute: ['poolUuid'],
                where: { id: secretPoolId }
            });
            return res.status(403).json({ errorMessage: `sub vault ${poolUuid.poolUuid} is already mapped with the vault` });
        }
        const mappingData = await VaultSecretPoolMapping.create({
            secretPoolId,
            vaultId,
            createdBy
        });
        if (mappingData) {
            res.json(mappingData);
        }
        res.send('Vault data is not available');

    } catch (error) {
        throw error;
    }
};

const deleteMapping = async (req, res) => {
    let { id } = req.body;
    const options = { where: id };
    try {
        const deleteMapping = await VaultSecretPoolMapping.destroy({
            where: { id: id }
        });
        if (deleteMapping) {
            res.json(deleteMapping);
        }
        res.send('Record does not exist');

    } catch (error) {
        throw error;
    }
};

module.exports = {
    createMapping,
    vaultMappingList,
    deleteMapping
};