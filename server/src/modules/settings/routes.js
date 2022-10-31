'use strict';

const express = require('express');

const devopsInfraRoutes = require('./devopsinfra/routes');
const enumRoutes = require('./enum/enumRoutes');

const apiRouter = express.Router();

module.exports = () =>
    apiRouter
        .use("/devopsinfra", devopsInfraRoutes())
        .use("/enum", enumRoutes())
