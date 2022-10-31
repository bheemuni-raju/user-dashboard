//const { Redis } = require('@byjus-orders/tyrion-plugins');
const Promise = require('bluebird');
const bunyan = require('../../../lib/bunyan-logger');
const config = require('../../../config');
const logger = bunyan('userCache');
const { get, isEmpty } = require('lodash');

const setUserCache = async (email, user, appName) => {
    const { redisClient } = global.byjus;
    if (redisClient) {
        let redisKey = getRedisKey(email, appName);
        const { data } = await redisClient.set(redisKey, JSON.stringify(user), 'EX', 18000);
        //logger.info({ method: 'setUserCache' }, `Setting user data to cache`);
        return data;
    }
    return null;
};

const getUserFrmCache = async (email, appName) => {
    let { redisClient } = global.byjus;
    if (redisClient) {
        let redisKey = getRedisKey(email, appName);
        let data = await redisClient.get(redisKey);
        //logger.info({ method: 'getUserFrmCache' }, `Getting user data from cache`);
        data = data ? JSON.parse(data) : data;
        return data;
    }
    return null;
};

const deleteUserFromCache = async (redisKey) => {
    try {
        const { redisClient } = global.byjus;
        if (redisClient) {
            await redisClient.del(redisKey);
            //logger.info({ method: 'deleteUserFromCache' }, `Deleting user data from cache`);
        }
    } catch (err) {
        console.log(err);
    }
};

const deleteUserCache = async (req, res) => {
    const { redisClient } = global.byjus;
    if (redisClient) {
        let redisKey = getRedisKey(req.params.cacheKey);
        //logger.info({ method: 'deleteUserCache' }, `Deleting user data from cache`);
        await deleteUserFromCache(redisKey);

        res.json("Cache deleted");
    }
    return null;
};

const getAllKeys = async () => {
    const { redisClient } = global.byjus;
    if (redisClient) {
        return new Promise((resolve, reject) => {
            let keyData = [];
            try {
                redisClient.keys('*', (err, key) => {
                    for (let i = 0; i < key.length; i++) {
                        keyData.push(key[i]);
                    }
                    resolve(keyData);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
}

const gettingKeys = async (req, res) => {
    const { redisClient } = global.byjus;
    if (redisClient) {
        const keys = await getAllKeys();
        res.json(keys);
    }
    return null;
}

const logoutUser = async (req, res) => {
    const { email } = req.user;
    let appName = get(req, "headers.x-app-origin", null);
    if (!email) return res.status(400).json({ message: 'LogOut UnSuccessful.' });
    let redisKey = getRedisKey(email, appName);
    deleteUserFromCache(redisKey);
    return res.status(200).json({ message: 'LogOut Successful.' });
};

const getRedisKey = (email, appName) => {
    let redisKey = !isEmpty(appName) ? email + "_" + appName : email;
    return redisKey;
}

module.exports = {
    setUserCache,
    deleteUserCache,
    getUserFrmCache,
    logoutUser,
    gettingKeys,
    deleteUserFromCache,
    getAllKeys
}