'use strict';

const express = require('express');
const { getBearerToken } = require('./thirdpartyController');

const router = express.Router();

module.exports = () => {
  router.route('/authentication/connect/token').get(getBearerToken);

  return router;
};
