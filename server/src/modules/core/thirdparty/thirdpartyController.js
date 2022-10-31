'use strict';

const { awsCognito } = require('@byjus-orders/nauth-wallet');

const getBearerToken = async (req, res) => {
  if (!req.headers['client-id'] || !req.headers['client-secret'])
    return res.status(400).json({ message: 'Please provide client-id & client-secret in req headers.' });
  return awsCognito.getBearerToken(req, res);
};

module.exports = {
  getBearerToken
};
