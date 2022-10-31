const bodyParser = require("body-parser");
const compress = require("compression");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const xmlParser = require("express-xml-bodyparser");

const setupWebsocket = require("./websocket");
const { getErrorMessage } = require("../lib/errors");
const { HttpError } = require("../lib/errors");
const apiRoutes = require("../routes");

const tracer = require('../utils/ddtraceInit.js');

module.exports = function init(io, contextMiddleware, correlationMiddleware, logger) {
  const app = express();
  process.env.NODE_ENV === "production" ? logger.setLevel("info") : logger.setLevel("debug");
  app.use(correlationMiddleware());
  app.use(contextMiddleware(logger));

  app.use(
    compress({
      filter(req, res) {
        return /json|text|javascript|css/.test(res.getHeader("Content-Type"));
      },
      level: 9,
    })
  );

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json({}));
  app.use(xmlParser());

  // Use helmet to secure Express headers
  app.use(helmet());
  app.disable("x-powered-by");

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
      return res.status(200).end();
    } else {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
      res.header('Access-Control-Expose-Headers', ['x-redirect']);
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
      return next();
    }
  });

  /* Middleware to intercept response object having error status code 
  and attach response data to the active span to get meaningful error message in Datadog  */

  app.use((req, res, next) => {
    const sendResponse = res.json;
    res.json = function (data) {
        const responseCodesToIntercept = [400,401,403,500];
        if (responseCodesToIntercept.includes(res?.statusCode)) {
            const span = tracer.scope().active();
            span.setTag('error.type', 'Error');
            span.setTag('error.message', JSON.stringify(data));
        }
        res.json = sendResponse;
        return res.json(data);
    }
    next();
  })

  app.use("/nucleusapi", apiRoutes());

  // Error handler
  app.use((err, req, res, next) => {
    if (!err) return next();
    // Dont log client errors or during testing
    if (process.env.NODE_ENV !== 'test' && !(err instanceof HttpError)) {
      console.error(err);
    }
    logger.error(err, 'error in express error handler middleware error callback');
    const error = getErrorMessage(err);
    logger.error(error, 'error in express error handler middleware');
    res.status(error.status).json({
      message: error.message,
      ...(error.paths ? { paths: err.paths } : {})
    });
  });

  if (io) {
    setupWebsocket(io);
  }

  // Return Express server instance
  return app;
};
