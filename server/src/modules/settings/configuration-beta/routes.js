const express = require('express')
const appRoleRoutes = require('./approle/appRoleRoutes')
const appGroupRoutes = require('./appgroup/appGroupRoutes')
const apiRouter = express.Router()

module.exports = () =>
    apiRouter
        .use(appRoleRoutes())
        .use(appGroupRoutes());