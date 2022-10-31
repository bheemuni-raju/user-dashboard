const { DevopsInfraConfig } = require('@byjus-orders/nexemplum/ums');

const commonController = require('../../../common/dataController');

const updateData = async (req, res) => {
    const { team, application } = req.body;

    try {
        await DevopsInfraConfig.updateOne({ team, application }, {
            "$set": {
                ...req.body
            }
        });

        return res.json(`Data updated successfully`);
    } catch (error) {
        throw new Error(error);
    }
}

const getApplicationConfig = async (req, res) => {
    const { team, application } = req.body;

    try {
        const data = await DevopsInfraConfig.findOne({ team, application });

        return res.json(data);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    ...commonController,
    updateData,
    getApplicationConfig
}