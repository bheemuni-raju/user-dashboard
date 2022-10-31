const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { get, isEmpty, startCase } = require('lodash');
const Promise = require('bluebird');

const { AppUser } = require('@byjus-orders/nexemplum/ums');
const appUserHelper = require('@byjus-orders/nfoundation/ums/user/appUserHelper');
const userCache = require('../user/userCache');
const bunyan = require('../../../lib/bunyan-logger');
const logger = bunyan('mfaController');

const initializeMfaAuthenticator = (appName) => {
    const envMap = {
        "development": "Dev",
        "staging": "Uat",
        "uat": "Uat",
        "production": "Prod",
    }

    const environment = envMap[process.env.NODE_ENV] || '';
    const mfaAuthenticator = speakeasy.generateSecret({
        name: `Byjus ${startCase(appName)} Application ${environment}`,
    });
    logger.info("Mfa Authenticator Secret:", JSON.stringify(mfaAuthenticator));
    return mfaAuthenticator;
}

const getQrCode = async (req, res) => {
    try {
        const appName = get(req, "headers.x-app-origin", "");
        const mfaAuthenticator = initializeMfaAuthenticator(appName);
        qrcode.toDataURL(mfaAuthenticator.otpauth_url, async function (err, data) {
            let { email = "", orgFormattedName = "" } = req.user;
            let updateCondition = {
                isMfaEnabled: false,
                mfaFactor: {
                    ...mfaAuthenticator,
                    qrCode: data
                }
            }

            await AppUser.updateOne({ email, orgFormattedName, appName }, {
                $set: updateCondition
            });

            res.json({ data });
        });
    }
    catch (error) {
        throw error;
    }
}

const disableMfa = async (req, res) => {
    try {
        const email = req.body.email || req.user.email;
        const orgFormattedName = req.body.orgFormattedName || req.user.orgFormattedName;

        const appName = get(req, "headers.x-app-origin", "");
        const updateCondition = {
            isMfaEnabled: false,
            mfaFactor: {}
        }

        await AppUser.updateOne({ email, orgFormattedName, appName }, {
            $set: updateCondition
        });

        const user = await appUserHelper.findAppUserByEmailId(email, appName);
        if (user) {
            await userCache.deleteUserFromCache(email + "_" + appName);
            await userCache.setUserCache(email, user, appName);
        }

        res.json({ message: "MFA disabled" });
    }
    catch (error) {
        throw error;
    }
}

const verifyTotp = async (req, res) => {
    try {
        const { email = "", token: totpToken = "", mfaSessionToken = "" } = req.body;
        const appName = get(req, "headers.x-app-origin", "");

        let userData = await appUserHelper.findAppUserByEmailId(email, appName);
        const cacheUser = await userCache.getUserFrmCache(email, appName);
        if (!isEmpty(cacheUser)) {
            let { mfaFactor = {}, mfaVerifiedArray = [] } = cacheUser || {};
            let { base32 = '' } = mfaFactor;

            if (isEmpty(mfaFactor)) {
                mfaFactor = get(userData, 'mfaFactor', {});

                if (isEmpty(mfaFactor)) {
                    throw new Error('Mfa Factor not registered');
                } else {
                    base32 = get(mfaFactor, 'base32', '');
                }
            }

            if (totpToken && base32) {
                const verified = speakeasy.totp.verify({
                    secret: base32,
                    encoding: 'base32',
                    token: totpToken
                });

                if (!isEmpty(mfaVerifiedArray)) {
                    await Promise.map(mfaVerifiedArray, async (mfaVerified) => {
                        if (mfaVerified.mfaSessionToken === mfaSessionToken) {
                            mfaVerified.isMfaVerified = verified;
                        }
                    });
                }

                await userCache.deleteUserFromCache(email + "_" + appName);
                userData["mfaVerifiedArray"] = mfaVerifiedArray;
                await userCache.setUserCache(email, userData, appName);
                return res.json({ verified });

            }
            else {
                throw new Error('Invalid Mfa factor');
            }
        }
    }
    catch (error) {
        throw error;
    }
}

const enableMFA = async (req, res) => {
    try {
        const { email = "", token = "", mfaSessionToken = "" } = req.body;
        const appName = get(req, "headers.x-app-origin", "");

        const userData = await appUserHelper.findAppUserByEmailId(email, appName);
        let { mfaFactor = {}, orgFormattedName, mfaVerifiedArray = [] } = userData || {};
        const { base32 } = mfaFactor;

        if (userData && !isEmpty(token)) {
            const verified = speakeasy.totp.verify({
                secret: base32,
                encoding: 'base32',
                token
            });

            await AppUser.updateOne({ email, orgFormattedName, appName }, {
                $set: {
                    isMfaEnabled: verified
                }
            });

            const user = await appUserHelper.findAppUserByEmailId(email, appName);
            if (user) {
                const mfaObj = {
                    mfaSessionToken,
                    isMfaVerified: verified
                }

                if (isEmpty(mfaVerifiedArray)) {
                    mfaVerifiedArray = [mfaObj];
                }
                else {
                    mfaVerifiedArray.push(mfaObj);
                }

                await userCache.deleteUserFromCache(email + "_" + appName);
                user["mfaVerifiedArray"] = mfaVerifiedArray;
                await userCache.setUserCache(email, user, appName);
            }

            res.json({ verified });
        }
    }
    catch (error) {
        throw error;
    }
}

module.exports = {
    getQrCode,
    enableMFA,
    verifyTotp,
    disableMfa
}
