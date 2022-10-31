const bunyan = require('bunyan');
const request = require('request-promise');
const get = require('lodash/get');
const { ByjusConfig } = require('@byjus-orders/nexemplum/oms');

const commonController = require('../../common/dataController');
const config = require('../../config');

const logger = bunyan.createLogger({
    name: 'Bujus-Config-Controller',
    env: process.env.NODE_ENV,
    serializers: bunyan.stdSerializers,
    src: true
});

const addConfig = async (req, res) => {
    try {
        const model = new ByjusConfig({ ...req.body });
        const doc = await model.save();
        return res.status(200).json(doc);
    } catch (error) {
        logger.error({ method: 'addConfig', error }, 'Error occured');
        return res.status(500).json({ error: error.message });
    }
}

const editConfig = async (req, res) => {
    try {
        const { formattedAppName, formattedModuleName } = req.body;
        const updatedBy = req.user.email;
        if (!formattedAppName || !formattedModuleName) throw new Error('Parameter missing');
        // if (req.body.hasOwnProperty("configs")) throw new Error("configs array can't be directly updated");
        if (formattedAppName != "LMS") throw new Error('Bad Request');
        const updatedDoc = await ByjusConfig.findOneAndUpdate(
            {
                formattedAppName, formattedModuleName
            },
            {
                $set: { ...req.body, updatedBy }
            },
            { new: true, runValidators: true }
        );
        if (!updatedDoc) throw new Error('Config not found');
        return res.status(200).json(updatedDoc);
    } catch (error) {
        logger.error({ method: 'editConfig', error }, 'Error occured');
        return res.status(500).json({ error: error.message });
    }
}

const listLogisticsUsers = async (req, res) => {
    try {
        const option = {
            uri: config.orders.OH_BASE_URL,
            method: 'PUT',
            body: {
                "method": "logistic_user",
                "tenantId": "811",
                "tokenId": config.orders.OH_TOKEN_ID,
                "page": 0 //setting this to 0 return all the logistic users 
            },
            json: true
        }
        const ohResponse = await request(option);
        const logisticUsers = get(ohResponse, "users") || [];
        return res.status(200).json(logisticUsers);
    } catch (error) {
        logger.error({ method: 'listLogisticsUsers', error }, 'Error occured');
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    ...commonController,
    editConfig,
    addConfig,
    listLogisticsUsers
}
