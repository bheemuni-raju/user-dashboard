const express = require('express');
const semanticConfigRoutes = require('./semantic/semanticRoute');
const applicationTypeRoutes = require('./applicationtype/applicationTypeRoute')
const environmentRoutes = require('./environment/environmentRoute')
const notificationChannelRoutes = require('./notificationchannel/notificationChannelRoute')

const apiRouter = express.Router();

module.exports = () => apiRouter.use("/semantic", semanticConfigRoutes())
apiRouter.use("/semantic/applicationtype", applicationTypeRoutes())
apiRouter.use("/semantic/environment", environmentRoutes())
apiRouter.use("/semantic/notificationchannel", notificationChannelRoutes())
