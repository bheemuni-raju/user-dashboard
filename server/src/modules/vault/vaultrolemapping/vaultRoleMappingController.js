const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const { _, isEmpty } = require('lodash');

const { Vault, VaultRoleMapping } = require('@byjus-orders/npgexemplum');
const { AppGroup } = require('@byjus-orders/nexemplum/ums');
const { Gridataemplate } = require('@byjus-orders/nexemplum/oms');
const { size, get, forEach } = require('lodash');

const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');


const listVaultRoleMapping = async (req, res) => {
    const { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [], gridId } = req.body;
    const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

    const sqlOrder = Object.keys(sort).map(item => {
        return [item, sort[item]];
    });

    try {
        let listVaultRoleMapping = [];
        if (!isEmpty(searchCriterias)) {
            const optionsForVault = {
                page: page || 1,
                paginate: limit || 10,
                where: { vaultUuid: { [Op.in]: searchCriterias.searchBuilder[0].selectedValue } },
                sort
            };

            const getVaultId = await Vault.paginate(optionsForVault);
            if (isEmpty(getVaultId.docs)) {
                return res.sendWithMetaData(getVaultId);
            }

            const vaultIds = [];
            getVaultId.docs.map(vaultId => {
                vaultIds.push(vaultId.id)
            })
            const optionForVault = {
                page: page || 1,
                paginate: limit || 10,
                where: { vaultId: { [Op.in]: vaultIds } },
                order: [['createdAt', 'DESC']],
                sort,
                include: [
                    {
                        model: Vault,
                        as: 'vaultMapping',
                        attribute: ['id']
                    }
                ]
            };
            listVaultRoleMapping = await VaultRoleMapping.paginate(optionForVault);

        } else {
            const options = {
                page: page || 1,
                paginate: limit || 10,
                order: [['createdAt', 'DESC']],
                where: sqlFilter,
                include: [
                    {
                        model: Vault,
                        as: 'vaultMapping',
                        attribute: ['id']
                    }
                ]
            };

            listVaultRoleMapping = await VaultRoleMapping.paginate(options);
        }


        const mappingData = []
        const appGroupIds = [];
        listVaultRoleMapping.docs.map(data => {
            appGroupIds.push(data.appGroupId)
        })
        const getUserAppGroup = await AppGroup.find(
            { _id: { $in: appGroupIds } }
        );

        listVaultRoleMapping.docs.map(data => {
            const { id, vaultId, createdBy, createdAt, updatedBy, updatedAt, vaultMapping, isActive } = data;
            let existingData = mappingData.find(res => res.vaultId === data.vaultId);

            getUserAppGroup.map(grpData => {
                if (data.appGroupId == grpData._id) {
                    if (!existingData) {
                        existingData = { id, vaultId, createdBy, createdAt, updatedBy, updatedAt, isActive, vaultMapping, vaultAppGroupMapping: [{ name: grpData.appGroupName, id: grpData._id }] }
                        mappingData.push(existingData);
                    } else {
                        existingData.vaultAppGroupMapping.push({ name: grpData.appGroupName, id: grpData._id });
                    }
                }
            })
        })

        if (!isEmpty(mappingData)) {
            return res.sendWithMetaData({ "docs": mappingData[0].vaultAppGroupMapping, "pages": listVaultRoleMapping.pages, "total": listVaultRoleMapping.total });
        }

        return res.sendWithMetaData({ "docs": mappingData, "pages": listVaultRoleMapping.pages, "total": listVaultRoleMapping.total });
    } catch (error) {
        throw error;
    }
};

const createVaultRoleMapping = async (req, res) => {
    const { vaultId, appGroupId = [], isActive } = req.body;
    let data = [];
    let mapppedData = {};
    for (let index = 0; index < appGroupId.length; index++) {
        mapppedData = {
            vaultId: vaultId,
            appGroupId: appGroupId[index],
            createdBy: req.user ? get(req.user, 'email') : 'system',
            isActive: "true"
        };
        data.push(mapppedData);
    }
    try {
        const checkUserGroupMapping = await VaultRoleMapping.count({
            attribute: ['vaultId'],
            where: { vaultId: vaultId, appGroupId: data[0].appGroupId }
        });

        if (checkUserGroupMapping) {
            return res.status(403).json({ errorMessage: `User group is already mapped with the vault` });
        }
        const insertData = await VaultRoleMapping.bulkCreate(data);
        if (insertData) {
            res.json(insertData);
        } else {
            res.send('No secretes are available');
        }
    } catch (error) {
        throw error;
    }
};

const updateVaultRoleMapping = async (req, res) => {
    const { id, vaultId, appGroupId, updatedAt } = req.body;

    try {
        const mappingData = [];
        let data = {};
        const checkVaultRoleMapping = await VaultRoleMapping.findAll({
            attributes: ['appGroupId'],
            where: { vaultId: vaultId, appGroupId: { [Op.in]: appGroupId } }
        });
        const existingAppGroupIds = [];
        for (let i = 0; i < checkVaultRoleMapping.length; i++) {
            existingAppGroupIds.push(checkVaultRoleMapping[i].appGroupId)
        }
        const newAppGroupIds = _.difference(appGroupId, existingAppGroupIds);

        if (newAppGroupIds.length !== 0) {
            for (let index = 0; index < newAppGroupIds.length; index++) {
                data = {
                    vaultId: vaultId,
                    appGroupId: newAppGroupIds[index],
                    isActive: true,
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: updatedAt
                };
                mappingData.push(data);
            }
            const insertData = await VaultRoleMapping.bulkCreate(mappingData);
            return res.send(insertData);
        }
        return res.json("New mapping not found");
    } catch (error) {
        throw error;
    }
};

const updateVaultRoleMappingStatus = async (req, res) => {
    const { id, vaultId, appGroupId, isActive } = req.body;
    try {
        const updateData = await VaultRoleMapping.update({
            vaultId, appGroupId, isActive,
            updatedBy: req.user ? get(req.user, 'email') : 'system'
        }, { where: { id: id } });
        if (updateData) {
            res.json(updateData);
        } else {
            res.send('No secretes are available');
        }
    } catch (error) {
        throw error;
    }
};

const deleteMapping = async (req, res) => {
    const { vaultId, userGroupId } = req.body;

    try {
        const deleteMapping = await VaultRoleMapping.destroy({
            where: { vaultId: vaultId, appGroupId: userGroupId }
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
    listVaultRoleMapping,
    createVaultRoleMapping,
    updateVaultRoleMapping,
    updateVaultRoleMappingStatus,
    deleteMapping
};