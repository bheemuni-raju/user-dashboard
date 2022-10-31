const express = require("express");

const apiRouter = express.Router();

const deploymentRequestRoutes = require("./devopsinfrarequest/routes");
const securityReportRoutes = require("./securitymanagement/routes");
const databaseMigrationRoutes = require("./databasemigration/databaseMigrationRoutes");
const databaseSeedingRoutes = require("./databaseseeding/databaseSeedingRoutes");

module.exports = () =>
  apiRouter
    .use("/deploymentrequest", deploymentRequestRoutes())
    .use("/securitymanagement", securityReportRoutes())
    .use("/databasemigrationRoutes", databaseMigrationRoutes())
    .use("/databaseseeding", databaseSeedingRoutes());
