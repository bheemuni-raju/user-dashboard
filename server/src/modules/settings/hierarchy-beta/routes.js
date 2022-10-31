const express = require('express')
const departmentRoutes = require('./department/departmentRoutes')
const subDepartmentRoutes = require('./subdepartment/subDepartmentRoutes')
const unitRoutes = require('./unit/unitRoutes')
const verticalRoutes = require('./vertical/verticalRoutes')
const campaignRoutes = require('./campaign/campaignRoutes')
const roleRoutes = require('./role/roleRoutes');
const cityRoutes = require('./city/cityRoutes');
const countryRoutes = require('./country/countryRoutes')
const organizationRoutes = require('./organization/organizationRoutes')
const apiRouter = express.Router()

module.exports = () =>
    apiRouter
        .use(departmentRoutes())
        .use(subDepartmentRoutes())
        .use(unitRoutes())
        .use(verticalRoutes())
        .use(campaignRoutes())
        .use(roleRoutes())
        .use(cityRoutes())
        .use(countryRoutes())
        .use(organizationRoutes());


