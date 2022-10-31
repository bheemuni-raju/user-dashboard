const express = require('express');
const gridTemplateRoutes = require('./gridtemplate/gridTemplateRoutes');

const apiRouter = express.Router()

module.exports = () =>
    apiRouter.use(gridTemplateRoutes())
