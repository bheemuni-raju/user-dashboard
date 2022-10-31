const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const { isEmpty } = require('lodash');

const { VaultLog, VaultRoleMapping, VaultSecretPoolMapping, Secret, Vault, VaultAudit, SecretPools, ApplicationType, Environment } = require('@byjus-orders/npgexemplum');
const { AppUser, AppGroup } = require('@byjus-orders/nexemplum/ums');
const { size, snakeCase } = require('lodash');

const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');
const { vaultApiKey, enableVaultCache, cryptoIvRandomBytes, vaultEncryptionSecret } = require('../../../config/environment');
const CrytoManager = require('../../../lib/crypto-helper');
const encryptOrDecrypt = new CrytoManager(cryptoIvRandomBytes);

const { redisClient } = global.byjus;
const logger = require('@byjus-orders/byjus-logger').child({ module: 'vaultManagementController'});

const vaultList = async (req, res) => {
    logger.info({method:"vaultList", requestObj: req.body}, "vaultList method initialized");

    /**params request from a body */
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    const options = {
        page: page || 1,
        paginate: limit || 10,
        sort,
        order: [['createdAt', 'DESC']],
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
        ],
        where: filter
    };
    try {
        const vaultList = await Vault.paginate(options);
        res.sendWithMetaData(vaultList);
    } catch (error) {
        logger.error(error, "Error in fetching VaultList data");
        throw error;
    }
};

const createVault = async (req, res) => {
    logger.info({method:"createVault", requestObj: req.body}, "createVault method initialized");

    const { id, description, isActive, createdBy, createdAt, applicationType, environment } = req.body;
    let { vaultUuid } = req.body;

    try {
        vaultUuid = snakeCase(vaultUuid);
        const checkVaultUuid = await Vault.count({
            attribute: ['vaultUuid'],
            where: { vaultUuid: vaultUuid }
        });
        if (checkVaultUuid) {
            return res.status(403).json({ errorMessage: `vault ${vaultUuid} is already exists ,Please use another vault uid` });
        }

        const vaultData = await Vault.create({
            id,
            vaultUuid,
            description,
            isActive,
            type,
            createdBy,
            createdAt,
            applicationType,
            environment,
            updatedBy: createdBy
        });
        if (vaultData) {
            res.json(vaultData);
        }
        res.send('Vault data is not available');
    } catch (error) {
        logger.error(error, "Error while creating Vault");
        throw error;
    }
};

const updateVault = async (req, res) => {
    logger.info({method:"updateVault", requestObj: req.body}, "updateVault method initialized");

    const { id, description, updatedBy, updatedAt } = req.body;
    let { vaultUuid } = req.body;

    try {
        vaultUuid = snakeCase(vaultUuid);
        const updateVault = await Vault.update({
            vaultUuid,
            description,
            updatedBy,
            updatedAt
        }, { where: { id: id } });
        if (updateVault) {
            res.json(updateVault);
        }
        res.send('Id does not match to update secret');

    } catch (error) {
        logger.error(error, "Error in updating Vault");
        throw error;
    }
};

const deleteVault = async (req, res) => {
    logger.info({method:"deleteVault", requestObj: req.body}, "deleteVault method initialized");

    const { id, isActive } = req.body;
    try {
        const deleteVault = await Vault.update({ isActive: isActive }, { where: { id: id } });
        if (deleteVault) {
            res.json(deleteVault);
        }
        res.send('Record does not exists.');

    } catch (error) {
        logger.error(error, "Error while deleting Vault");
        throw error;
    }
};

const environmentSecretByVaultUuid = async (req, res) => {
    const { vaultUuid } = req.body;

    try {
        let enableVaultCaching = enableVaultCache;
        if (typeof (enableVaultCaching) == "string") {
            enableVaultCaching = (enableVaultCaching.toLowerCase() === 'true');
        }
        const todaysDate = new Date();
        const developerToken = req.headers["x-developer-token"];
        if (isEmpty(developerToken)) {
            return res.status(401).json({ message: "Please provide byjus developer token!" });
        }
        if (req.headers["x-api-key"] !== vaultApiKey) {
            return res.status(401).json({ message: "Invalid api key!" });
        }
        const userOs = req.headers['x-user-os'];

        let noCache = req.headers["x-no-cache"];
        if (typeof (noCache) == "string") {
            noCache = (noCache.toLowerCase() === 'true');
        }

        const getMailId = await AppUser.findOne(
            {
                $and: [
                    { "developerTokenSetting.token": developerToken },
                    { "developerTokenSetting.expireAt": { "$gte": todaysDate } }
                ]
            }
        );

        if (isEmpty(getMailId)) {
            return res.status(401).json({ message: `An unauthorized user attempted to access the ${vaultUuid}.` });
        }

        const getUserAppGroup = await AppGroup.find(
            { "appGroupUsers": getMailId.email }
        );

        if (isEmpty(getUserAppGroup)) {
            return res.status(400).json({ message: `${getMailId.email} does not have access to the vault ${vaultUuid}.` });
        }
        const userAppGroupIds = [];
        getUserAppGroup.map(appUserData => {
            userAppGroupIds.push(`${appUserData._id}`);
        });

        const getVaultId = await Vault.findOne({ attributes: ['id'], where: { "vaultUuid": vaultUuid, isActive: 'true' } });
        if (isEmpty(getVaultId)) {
            return res.status(400).json({ message: "Invalid vault uid! Please provide a valid vault uid." });
        }

        const checkVaultRoleMapping = await VaultRoleMapping.findAll({ where: { vaultId: getVaultId.id, appGroupId: { [Op.in]: userAppGroupIds } } });
        if (isEmpty(checkVaultRoleMapping)) {
            return res.status(400).json({ message: `${vaultUuid} is not assigned to the ${getMailId.email}!` });
        }

        if (enableVaultCaching == true && noCache == true) {
            const cacheSecret = await redisClient.get(vaultUuid);
            if (!isEmpty(cacheSecret)) {
                return res.send(cacheSecret)
            }
        }

        const secretPool = await VaultSecretPoolMapping.findAll({
            attributes: ['secretPoolId'],
            where: { vaultId: getVaultId.id },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isEmpty(secretPool)) {
            return res.send(secretPool);
        }
        const secretPoolIds = [];
        secretPool.map(poolData => {
            secretPoolIds.push(`${poolData.secretPoolId}`);
        });

        const secrets = await Secret.findAll({
            attributes: ['secretPoolId', 'name', 'value', 'type'],
            where: { secretPoolId: { [Op.in]: secretPoolIds } },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isEmpty(secrets)) {
            return res.send(secrets);
        }

        const userIpAddress = (req.headers['x-forwarded-for'] && (req.headers['x-forwarded-for']).split(',', 1).pop()) ||
            (req.connection.remoteAddress || (req.connection.remoteAddress).split(':', 1).pop())
        req.socket.remoteAddress || req.ip;
        await VaultLog.create({
            "vaultId": getVaultId.dataValues.id,
            "developerToken": developerToken,
            "email": getMailId.email,
            "accessedDate": todaysDate,
            "operatingSystem": userOs,
            "ipAddress": userIpAddress,
            "createdAt": todaysDate,
            "createdBy": getMailId.email
        });
        const poolOrderIndex = [];
        secretPoolIds.map(id => {
            poolOrderIndex.push(parseInt(id));
        })
        secrets.map(secretData => {
            secretData.value = encryptOrDecrypt.decrypt(secretData.value, vaultEncryptionSecret);
        })

        secrets.sort(function (a, b) {
            var A = a.secretPoolId, B = b.secretPoolId;

            if (poolOrderIndex.indexOf(A) > poolOrderIndex.indexOf(B)) {
                return 1;
            } else {
                return -1;
            }
        });

        if (enableVaultCaching == true && noCache == true) {
            await redisClient.set(vaultUuid, JSON.stringify(secrets), 'EX', 36000);
        }
        return res.send(secrets);
    } catch (error) {
        throw error;
    }
};

const secretKeyByVaultUuid = async (req, res) => {
    const { vaultUuid } = req.body;

    try {
        const todaysDate = new Date();
        const developerToken = req.headers["x-developer-token"];
        if (isEmpty(developerToken)) {
            return res.send("Provide developer token");
        }

        const getMailId = await AppUser.findOne(
            {
                $and: [
                    { "developerTokenSetting.token": developerToken },
                    { "developerTokenSetting.expireAt": { "$gte": todaysDate } }
                ]
            });
        if (isEmpty(getMailId)) {
            return res.json("Invalid token");
        }

        return res.json({ "EncryptionKey": vaultEncryptionSecret });
    } catch (error) {
        throw error;
    }
};

const vaultLogList = async (req, res) => {
    /**params request from a body */
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;
    const group = ['email', 'vaultId'];
    const order = [Sequelize.literal('id DESC')];
    try {
        let getVaultLogIds;
        const vaultLogIds = [];

        if (!isEmpty(searchCriterias)) {
            const optionsForVault = {
                page: page || 1,
                paginate: limit || 10,
                where: { vaultUuid: { [Op.in]: searchCriterias.searchBuilder[0].selectedValue } },
                sort
            };

            getVaultLogIds = await Vault.paginate(optionsForVault);
            if (isEmpty(getVaultLogIds.docs)) {
                return res.sendWithMetaData(getVaultLogIds);
            }

            getVaultLogIds.docs.map(data => {
                vaultLogIds.push(data.id);
            })
        } else {
            getVaultLogIds = await VaultLog.findAll({
                attributes: ['email', 'vaultId', [Sequelize.fn('max', Sequelize.col('id')), 'id']],
                group, order
            });
            getVaultLogIds && getVaultLogIds.map(data => {
                vaultLogIds.push(data.id);
            })
        }

        const options = {
            page: page || 1,
            paginate: limit || 10,
            sort: sort,
            where: { id: { [Op.in]: vaultLogIds } },
            attributes: ['accessedDate', 'email', 'operatingSystem', 'ipAddress', 'vaultId'],
            order: [['accessedDate', 'DESC']],
            include: [{
                model: Vault,
                as: 'vault',
                attribute: ['id']
            }]
        };
        const vaultLogList = await VaultLog.paginate(options, group);
        res.sendWithMetaData(vaultLogList);
    } catch (error) {
        throw error;
    }
};

const vaultAuditLogList = async (req, res) => {
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    const options = {
        page: page || 1,
        paginate: limit || 10,
        sort,
        where: filter,
        attributes: ['secretPoolId', 'previousValue', 'currentValue', 'name', 'createdBy', 'createdAt'],
        include: [{
            model: SecretPools,
            as: 'SecretPools',
            attribute: ['id']
        }]
    };
    try {
        const vaultAuditList = await VaultAudit.paginate(options);
        vaultAuditList.docs.map(secretData => {
            secretData.currentValue = encryptOrDecrypt.decrypt(secretData.currentValue, vaultEncryptionSecret);
            secretData.previousValue = encryptOrDecrypt.decrypt(secretData.previousValue, vaultEncryptionSecret);
        })
        res.sendWithMetaData(vaultAuditList);
    } catch (error) {
        throw error;
    }
};

const getVaultLogListByEmail = async (req, res) => {
    /**params request from a body */
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    const sqlOrder = Object.keys(sort).map(item => {
        return [item, sort[item]];
    });

    try {
        const options = {
            page: page || 1,
            paginate: limit || 10,
            order: sqlOrder,
            where: sqlFilter,
            include: [{
                model: Vault,
                as: 'vault',
                attribute: ['id']
            }],
            order: [['accessedDate', 'DESC']],
        };

        const vaultLogList = await VaultLog.paginate(options);
        res.sendWithMetaData(vaultLogList);
    } catch (error) {
        throw error;
    }
};

const getVaultLogListByVaultUid = async (req, res) => {
    /**params request from a body */
    let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    const sqlOrder = Object.keys(sort).map(item => {
        return [item, sort[item]];
    });

    try {
        const options = {
            page: page || 1,
            paginate: limit || 10,
            order: sqlOrder,
            where: sqlFilter,
            include: [{
                model: Vault,
                as: 'vault',
                attribute: ['id']
            }],
            order: [['accessedDate', 'DESC']],
        };

        const vaultLogList = await VaultLog.paginate(options);
        res.sendWithMetaData(vaultLogList);
    } catch (error) {
        throw error;
    }
};

const getVaultDetailsById = async (req, res) => {
    /**params request from a body */
    const { id } = req.body;

    const options = {
        where: { id: id }
    };
    try {
        const vaultDetails = await Vault.findOne(options);
        return res.send(vaultDetails);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createVault,
    vaultList,
    updateVault,
    deleteVault,
    environmentSecretByVaultUuid,
    secretKeyByVaultUuid,
    vaultLogList,
    vaultAuditLogList,
    getVaultLogListByEmail,
    getVaultLogListByVaultUid,
    getVaultDetailsById
};