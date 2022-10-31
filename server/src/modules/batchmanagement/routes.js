const express = require("express");

const jobDefinitionRoutes = require("./jobdefinition/jobDefinitionRoutes");
const jobRoutes = require("./job/jobRoutes");
const jobQueueRoutes = require("./jobqueue/jobQueueRoutes");
const computeEnvRoutes = require("./computeenv/computeEnvRoutes");
const reportRoutes = require("./report/reportRoutes");
const uploadRoutes = require("./upload/uploadRouter");
const emailUploadRoutes = require("./emailUpload/uploadRouter");
const grnBarcodeGenerationRoutes = require("./grnBarcodeGeneration/grnBarcodeGenerationRoutes");

const apiRouter = express.Router();

module.exports = () =>
  apiRouter
    .use("/jobdefinition", jobDefinitionRoutes())
    .use("/job", jobRoutes())
    .use("/jobqueue", jobQueueRoutes())
    .use("/computeenv", computeEnvRoutes())
    .use("/report", reportRoutes())
    .use("/upload", uploadRoutes())
    .use("/emailUpload", emailUploadRoutes())
    .use("/grnbarcodegeneration", grnBarcodeGenerationRoutes());
