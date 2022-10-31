//#TODO: disable profiling in production environment for better performance
const ddOptions = {
  env: process.env.NODE_ENV,
  runtimeMetrics: true
};

const tracer = require('dd-trace').init(ddOptions);


module.exports = tracer;

