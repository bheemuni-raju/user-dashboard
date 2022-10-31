'use strict';

const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const { signSecret } = require('../config');

/**
 * This is just a middleware configurations added for auth handling
 * using jsonWebTokens. For security concerns we will keep a track of
 * all accessTokens that are generated ;)
 */

const createTokens = async user => {
  const accessToken = await jwtSign(user, { expiresIn: '20m' });
  const refreshToken = await jwtSign(user, { expiresIn: '1d' });

  return {
    accessToken,
    refreshToken,
  };
};

const jwtSign = async (user, expiry) => {
  const token = jwt.sign({ userId: user._id }, signSecret, expiry);
  return token;
};

const jwtVerify = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, signSecret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });

module.exports = {
  jwtSign,
  jwtVerify,
  createTokens,
};
