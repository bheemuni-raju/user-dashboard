const bunyan = require('bunyan');
const { get, isEmpty } = require('lodash');
const { ByjusConfig } = require("@byjus-orders/nexemplum/oms");

const logger = bunyan.createLogger({
    name: 'Payment-Config-Controller',
    env: process.env.NODE_ENV,
    serializers: bunyan.stdSerializers,
    src: true
});

const getPaymentConfig = async (req, res) => {
    try {
        const { configName } = req.query;
        const paymentConfig = await ByjusConfig.findOne({ formattedAppName: "MIDDLEWARE", formattedModuleName: "PAYMENT" }).select("configs");

        let result = get(paymentConfig, "configs", []);
        if (!isEmpty(configName)) {
            result = result.filter(conf => conf.formattedName === configName);
        }
        return res.status(200).json(result);
    } catch (error) {
        logger.error({ method: 'getPaymentConfig', error }, 'Error occured');
        return res.status(500).json({ error: error.message });
    }
}

const editPaymentConfig = async (req, res) => {
    try {
        const { configName, updatedBy } = req.query;
        const { formattedName } = req.body;
        if (!configName || !updatedBy || !formattedName) throw Error('Parameter missing');
        if (formattedName !== configName) throw Error('formattedName should be same as configName');

        const updatedDoc = await ByjusConfig.findOneAndUpdate(
            {
                formattedAppName: "MIDDLEWARE",
                formattedModuleName: "PAYMENT",
                "configs.formattedName": configName
            },
            {
                $set: {
                    "configs.$": { ...req.body },
                    updatedBy
                }
            },
            { new: true }
        );
        if (isEmpty(updatedDoc)) throw new Error('Config not found');

        const updatedConfig = get(updatedDoc, "configs", []).filter(ele => ele.formattedName === configName);
        return res.status(200).json(updatedConfig);
    } catch (error) {
        logger.error({ method: 'getPaymentConfig', error }, 'Error occured');
        return res.status(500).json({ error: error.message });
    }
}

const addPaymentConfig = async (req, res) => {
    try {
        const { updatedBy } = req.query;
        const { formattedName } = req.body;
        if (!formattedName || !updatedBy) throw Error('Parameter missing');

        const paymentConfig = await ByjusConfig.findOne({
            formattedAppName: "MIDDLEWARE",
            formattedModuleName: "PAYMENT",
            "configs.formattedName": formattedName
        }).select("configs");
        if (paymentConfig) throw new Error('Config already exist');

        const updatedDoc = await ByjusConfig.findOneAndUpdate(
            {
                formattedAppName: "MIDDLEWARE",
                formattedModuleName: "PAYMENT"
            },
            {
                $push: { configs: { ...req.body } },
                $set: { updatedBy }
            },
            { new: true }
        );
        const updatedConfig = get(updatedDoc, "configs", []).filter(ele => ele.formattedName === formattedName);
        return res.status(200).json(updatedConfig);
    } catch (error) {
        logger.error({ method: 'getPaymentConfig', error }, 'Error occured');
        return res.status(500).json({ error: error.message });
    }
}

const deletePaymentConfig = async (req, res) => {
    try {
        const { configName, updatedBy } = req.query;
        if (!configName || !updatedBy) throw Error('Parameter missing');

        const actualDoc = await ByjusConfig.findOne(
            {
                formattedAppName: "MIDDLEWARE",
                formattedModuleName: "PAYMENT",
                "configs.formattedName": configName
            }
        ).select("configs").lean();
        if (!actualDoc) throw new Error('Config not found');

        const confToDeletete = get(actualDoc, "configs", []).find(ele => ele.formattedName === configName);

        const updatedDoc = await ByjusConfig.findOneAndUpdate(
            {
                formattedAppName: "MIDDLEWARE",
                formattedModuleName: "PAYMENT"
            },
            {
                $pull: { configs: { formattedName: configName } },
                $set: { updatedBy }
            },
            { new: true }
        );
        const isdeleted = get(updatedDoc, "configs", []).filter(ele => ele.formattedName === configName).length === 0;
        if (!isdeleted) throw new Error("Unable to delete config");

        if (isdeleted && confToDeletete.isDp) {
            /* Can't use $pull for sub array. Using $set */
            const configs = get(updatedDoc, "configs", []);
            configs.map(ele => {
                if (ele.hasOwnProperty("allowedDownPayments")) {
                    ele.allowedDownPayments = ele.allowedDownPayments.filter(e => e !== configName);
                }
            })
            await ByjusConfig.updateMany(
                {
                    formattedAppName: "MIDDLEWARE",
                    formattedModuleName: "PAYMENT"
                },
                {
                    $set: { configs }
                }
            );
        }
        return res.status(200).json("Config deleted successfully");
    } catch (error) {
        logger.error({ method: 'getPaymentConfig', error }, 'Error occured');
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getPaymentConfig,
    editPaymentConfig,
    addPaymentConfig,
    deletePaymentConfig
}
