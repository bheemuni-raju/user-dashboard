const express = require('express')
const permissionTemplateRoutes = require('./permissiontemplate/permissionTemplateRoutes')
const permissionModuleRoutes = require('./permissionmodule/permissionModuleRoutes')

const apiRouter = express.Router()

module.exports = () =>
    apiRouter
        .use(permissionTemplateRoutes())
        .use(permissionModuleRoutes())