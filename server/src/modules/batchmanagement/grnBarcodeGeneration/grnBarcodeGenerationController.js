const { Job, JobDefinition } = require("@byjus-orders/nexemplum/oms");

const bunyan = require("../../../lib/bunyan-logger");
const batchJobUtil = require("../awsBatchService");

const logger = bunyan("Grn Barcode Generation Job");

const startJob = async (req, res) => {
  const { grnId, scheduledBy, inwardDate } = req.body;
  const message = [];

  logger.info({ method: "startJob" }, "Request body : ", req.body);

  try {
    const jobDetails = await JobDefinition.findOne({
      jobDefinitionName: "grn-barcode-generation-job",
    }).lean();
    const { containerProperties, jobDefinitionArn, jobDefinitionName } =
      jobDetails;
    const { environment } = containerProperties || {};

    const jobQueue =
      process.env.NODE_ENV === "development"
        ? "common-job-queue"
        : "wms-job-queue";

    const environmentVars = [
      { name: "GRN_ID", value: grnId },
      { name: "INWARD_DATE", value: inwardDate },
      { name: "SCHEDULED_BY", value: scheduledBy },
      ...environment,
    ];

    const jobParams = {
      jobDefinitionArn,
      jobDefinitionName,
      jobName: "grn-barcode-generation-job",
      jobQueue,
    };

    const result = await batchJobUtil.submitJob(
      jobParams.jobName,
      jobParams.jobQueue,
      jobParams.jobDefinitionName,
      environmentVars
    );
    const newJob = new Job({
      jobName: "grn-barcode-generation-job",
      jobId: result.data.jobId,
      jobDefinition: "grn-barcode-generation-job",
      jobParams: environmentVars,
    });

    const savedJob = await newJob.save();

    logger.info({ method: "startJob" }, `Response : ${savedJob}`);

    return res.json({
      status: 200,
      message: "success",
      data: savedJob,
    });
  } catch (error) {
    logger.error(
      { method: "startJob" },
      `Error in saving job : ${error.message}`
    );
    message.push(error.message);
  }

  return res.status(500).json({ message });
};

module.exports = {
  startJob,
};
