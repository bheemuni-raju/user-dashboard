'use strict';

const express = require('express');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const { awsCognito } = require('@byjus-orders/nauth-wallet');
const { NotFoundError } = require('./lib/errors');
const commonRoutes = require('./common/dataRoutes');
const responseMiddleware = require('./common/middlewares/responseMiddleware');

/* Module Related Routes */
const userRelatedRoutes = require('./modules/routes');
const supplyChainRoutes = require('./modules/supplychain/routes');
const attendanceRelatedRoutes = require('./modules/businessdevelopment/attendancemanagement/attendanceRoute');
const attritionRelatedRoutes = require('./modules/businessdevelopment/attritionmanagement/attritionRoute');
const batchRoutes = require('./modules/batchmanagement/routes');
const dashboardRoutes = require('./modules/dashboardmanagement/dashboardRoutes');
const analyticsRoutes = require('./modules/analyticsmanagement/routes');
const supportRoutes = require('./modules/supportmanagement/routes');
const byjusConfigRoutes = require('./modules/byjusconfigmanagement/routes');
const settingsRelatedRoutes = require('./modules/settings/routes');
const config = require('./config/config');
const apiRouter = express.Router();
const { context } = require('@byjus-orders/byjus-logger')
const tracer = require('./utils/ddtraceInit.js');

apiRouter.use(cookieParser());
apiRouter.use(responseMiddleware);

apiRouter.use((req, res, next) => {
  const checkUri = config.whiteListUri.filter(uri => req.path.includes(uri));
  // if (req.headers && (req.headers['x-app-origin'] === 'payment-app' || req.headers['x-app-origin'] === 'oms-app')) 
  if (checkUri.length !== 0) {
    return next();
  }
  awsCognito.cognitoValidator(req, res, next);
}
);
apiRouter.use((req, res, next) => {
  if (context.getStore()) {
    const orgName = req?.user?.orgFormattedName || undefined
    const orgId = req?.user?.orgId || undefined
    context.getStore().set('tenant-id', orgId)
    context.getStore().set('tenant-name', orgName)
  }
  next()
})

/* This middleware sets "tenantId" and "tenantName" custom tags into datadog and is placed here as 
it has dependency on data from context */

apiRouter.use((req, res, next) => {
  try {
    const span = tracer.scope().active();
    const byjusCorrelationId = context?.getStore()?.get('x-byjus-request-trace-id');
    const tenantId = context?.getStore()?.get('tenant-id');
    const tenantName = context?.getStore()?.get('tenant-name');
    if (span) {
      const topSpan = span.context()._trace.started[0];
      topSpan.setTag('byjusCorrelationId', byjusCorrelationId);
      topSpan.setTag('tenantId', tenantId);
      topSpan.setTag('tenantName', tenantName);
    }
    next();
  } catch (err) {
    next(err);
  }
})

module.exports = () =>
  apiRouter
    .use("/usermanagement/common", commonRoutes())
    .use("/usermanagement/dashboard", dashboardRoutes())
    .use("/usermanagement", userRelatedRoutes())
    .use("/usermanagement/supplychain", supplyChainRoutes())
    .use("/usermanagement/attendance", attendanceRelatedRoutes())
    .use("/usermanagement/attrition", attritionRelatedRoutes())
    .use("/usermanagement/analyticsmanagement", analyticsRoutes())
    .use("/usermanagement/settings", settingsRelatedRoutes())
    .use("/batchmanagement", batchRoutes())
    .use(supportRoutes())
    .use(byjusConfigRoutes())
    .use('/usermanagement/getMfaUserToken', (req, res) => {
      res.json({ mfaSessionToken: uuid() });
    })
    .get('/usermanagement/healthcheck', (req, res) => {
      res.send('microservies-ums is up and running');
    })
    .get("/usermanagement/throwerror", (req, res) => {
      if (Math.random() > 0.5) {
        res.status(500).send({
          status: "error"
        });
        throw new Error("Mock error for datadog!!");
      } else {
        res.status(200).send({
          status: "success",
        })
      }

    })
    .all('*', () => {
      throw new NotFoundError();
    });

