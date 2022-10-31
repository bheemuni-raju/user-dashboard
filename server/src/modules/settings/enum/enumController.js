const { get } = require('lodash');

const { EnumTemplate } = require('@byjus-orders/nexemplum/ums');
const commonController = require('../../../common/dataController');

const createEnum = async (req, res) => {
    const { enumId, description, app, module, enums } = req.body;

    try {
        await EnumTemplate.create({
            enumId,
            description,
            app,
            module,
            enums,
            createdBy: get(req, 'user.email'),
            updatedBy: get(req, 'user.email')
        });

        res.json(`Enum - ${enumId} is created.`);
    } catch (error) {
        throw new Error(error);
    }
}

const getEnum = async (req, res) => {
    const { enumId } = req.params;

    try {
        const enumData = await EnumTemplate.findOne({ enumId });

        if (!enumData) throw new Error(`${enumId} not found`);
        res.json(enumData);
    } catch (error) {
        throw new Error(error);
    }
}

const updateEnum = async (req, res) => {
    const { enumId, enums = [] } = req.body;

    try {
        const enumData = await EnumTemplate.updateOne({ enumId }, {
            $set: {
                enums
            }
        }, {
            new: true
        });

        res.json(enumData);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    ...commonController,
    createEnum,
    updateEnum,
    getEnum
}