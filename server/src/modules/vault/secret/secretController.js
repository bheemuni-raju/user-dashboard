const { Secret, VaultAudit, SecretPools } = require('@byjus-orders/npgexemplum');

const crypto = require('crypto');
const { size, isEmpty } = require('lodash');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const CrytoManager = require('../../../lib/crypto-helper');
const encryptOrDecrypt = new CrytoManager(process.env.CRYPTO_IV_RANDOM_BYTES);

const listSecret = async (req, res) => {
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
            where: sqlFilter
        }

        const listSecret = await Secret.paginate(options);

        listSecret.docs.map(secretData => {
            secretData.value = encryptOrDecrypt.decrypt(secretData.value, process.env.VAULT_ENCRYPTION_SECRET);
        })
        res.sendWithMetaData(listSecret);
    } catch (error) {
        throw error;
    }
};

const getSecretListByPoolId = async (req, res) => {
    let id = req.body.id
    try {
        const oneResults = await Secret.findAll({ where: { secret_pool_id: id } });
        res.sendWithMetaData(oneResults);
    } catch (error) {
        throw error;
    }
};

const createSecret = async (req, res) => {
    const { secretPoolId, name, value, type, createdBy, createdAt } = req.body;

    let encryptedValue;
    if (process.env.IS_VAULT_ENCRYPTION_ENABLED === "true") {
        encryptedValue = encryptOrDecrypt.encrypt(value, process.env.VAULT_ENCRYPTION_SECRET);
    } else {
        encryptedValue = value;
    }

    try {
        const secretName = name.toUpperCase();
        const checkSecretName = await Secret.count({
            where: { secretPoolId: secretPoolId, name: secretName }
        });
        if (checkSecretName) {
            const fetchPoolUid = await SecretPools.findOne({
                attribute: ['poolUuid'],
                where: { id: secretPoolId }
            });
            return res.status(403).json({ errorMessage: `Secret name is already exists in ${fetchPoolUid.poolUuid} pool` });
        }
        const insertData = await Secret.create({
            secretPoolId,
            name: secretName,
            value: encryptedValue,
            type,
            createdBy,
            createdAt
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

const updateSecret = async (req, res) => {
    const { id, name, value, type, updatedBy, updatedAt, secretPoolId } = req.body;

    let encryptedValue;
    if (process.env.IS_VAULT_ENCRYPTION_ENABLED === "true") {
        encryptedValue = encryptOrDecrypt.encrypt(value, process.env.VAULT_ENCRYPTION_SECRET);
    } else {
        encryptedValue = value;
    }

    try {
        const getPreviousValue = await Secret.findOne({ where: { id: id } });
        let previousValue = getPreviousValue.value;

        const checkSecretName = await Secret.count({
            where: {
                id: {
                    [Op.ne]: id
                }, name: name, secretPoolId: secretPoolId
            }
        });
        if (checkSecretName) {
            return res.status(403).json({ errorMessage: `Secret names ${name} is already exists in sub vault` });
        }

        await VaultAudit.create({
            name: name,
            previousValue: previousValue,
            currentValue: encryptedValue,
            secretPoolId: secretPoolId,
            secretId: id,
            createdBy: updatedBy,
            createdAt: updatedAt
        });

        const updateData = await Secret.update({
            name,
            value: encryptedValue,
            type,
            updatedBy,
            updatedAt
        }, { where: { id: id } });
        if (updateData) {
            res.json(updateData);
        } else {
            res.send('Id does not match to update secret');
        }
    } catch (error) {
        throw error;
    }
};

const deleteSecret = async (req, res) => {
    const { id, isActive } = req.body;
    try {
        const deleteData = await Secret.update({ isActive: isActive }, { where: { id: id } });
        if (deleteData) {
            res.json(deleteData);
        } else {
            res.send('Record not exists.');
        }
    } catch (error) {
        throw error;
    }
};

const bulkSecretCreate = async (req, res) => {
    const { secretDetails } = req.body;

    try {
        const secretNames = [];
        secretDetails.map(data => {
            secretNames.push(data.name);
            if (process.env.IS_VAULT_ENCRYPTION_ENABLED === "true") {
                data.value = encryptOrDecrypt.encrypt(data.value, process.env.VAULT_ENCRYPTION_SECRET);
            }
        })

        const secretPoolId = secretDetails[0].secretPoolId;
        const validateSecretNames = await Secret.findAll({ where: { secretPoolId: secretPoolId, name: { [Op.in]: secretNames } } });

        if (!isEmpty(validateSecretNames)) {
            const existingSecrets = []
            validateSecretNames.map(data => {
                existingSecrets.push(data.name);
            })
            const fetchPoolUid = await SecretPools.findOne({
                attribute: ['poolUuid'],
                where: { id: secretPoolId }
            });
            return res.status(403).json({ errorMessage: `Secret names ${existingSecrets} is already exists in ${fetchPoolUid.poolUuid}` });
        }
        const insertData = await Secret.bulkCreate(secretDetails);
        if (insertData) {
            res.json(insertData);
        } else {
            res.send('No secretes are available');
        }
    } catch (error) {
        throw error;
    }
};


module.exports = {
    createSecret,
    listSecret,
    updateSecret,
    getSecretListByPoolId,
    deleteSecret,
    bulkSecretCreate
};