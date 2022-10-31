const mongoose = require('mongoose');
const uuid = require('uuid');

const { AppUser } = require('@byjus-orders/nexemplum/ums');

const generateToken = async (req, res) => {
    const { email, appName } = req.body;
    try {
        const today = new Date();
        var expireAt = new Date(new Date().setDate(new Date().getDate() + 30));
        const token = uuid();
        const developerTokenSetting = {
            token: token,
            createdAt: today,
            expiration: {
                dateformat: "day",
                threshold: 30
            },
            expireAt:expireAt
        };
        
        await AppUser.updateOne({ email: email, appName: appName }, {
            $set: {
                developerTokenSetting: developerTokenSetting
            }
        });
        res.json(token);
    } catch (error) {
        throw error;
    }
}

const deleteToken = async (req, res) => {
    const { email, appName } = req.body;
    try {
        await AppUser.updateOne({ email: email, appName: appName }, {
            $set: {
                developerTokenSetting: null
            }
        });
        res.json("Token Deleted");
    } catch (error) {
        throw error;
    }
}

const getDeveloperTokenExpiry = async (req, res) => {
    const { email, appName } = req.body;
    try {
        const developerTokenDetails =await AppUser.findOne({ email: email, appName: appName });
        res.json(developerTokenDetails);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    generateToken,
    deleteToken,
    getDeveloperTokenExpiry
}
