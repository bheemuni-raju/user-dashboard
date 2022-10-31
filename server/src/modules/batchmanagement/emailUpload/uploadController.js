const bunyan = require("bunyan");
const moment = require("moment");
const { S3 } = require("@byjus-orders/tyrion-plugins");
const { Job } = require("@byjus-orders/nexemplum/oms");
const { EmailFileUpload } = require("@byjus-orders/nexemplum/lms");

const config = require("../../../config/environment");
const commonController = require("../../../common/dataController");
const { BatchNameMapping } = require("./uploadConstants");
const batchJobUtil = require("../awsBatchService");

const logger = bunyan.createLogger({
  name: "Batch - upload Job controller",
  env: process.env.NODE_ENV,
  serializers: bunyan.stdSerializers,
  src: true,
});

S3.init(config.awsS3.accessKeyId, config.awsS3.secretAccessKey);

const getTemplates = async (req, res) => {
  const { referenceId } = req.params;
  const document = await EmailFileUpload.findOne({ referenceId });
  res.json({ document, templates: Object.keys(BatchNameMapping) });
};

/**
 * For handling upload data functionality using aws batch jobs
 * actually for doing this JobDefinition entry need to be created
 * @param {*} param0
 */
const scheduleJob = async (req, res) => {
  const { userEmailId, s3Url, uploadedFileType, referenceId } = req.body;
  let { jobName } = req.body.jobName;
  const jobDefinitionName =
    process.env.NODE_ENV === "uat" ? "uat-upload-job" : "upload-job";

  try {
    const environmentVars = [
      {
        name: "UPLOAD_TEMPLATE_NAME",
        value: BatchNameMapping[uploadedFileType],
      },
      {
        name: "S3_FILE_URL",
        value: s3Url,
      },
      {
        name: "SCHEDULED_BY",
        value: userEmailId,
      },
    ];

    /** If jobName is having space, replace it with _ */
    jobName = jobName.replace(/ /g, "_");
    const queueName =
      process.env.NODE_ENV === "uat" ? "uat-common-queue" : "upload-queue";
    const result = await batchJobUtil.submitJob(
      jobName,
      queueName,
      jobDefinitionName,
      environmentVars
    );

    const newJob = new Job({
      jobName,
      jobId: result.data.jobId,
      jobDefinition: jobDefinitionName,
      jobParams: environmentVars,
      createdBy: userEmailId,
    });
    const savedJob = await newJob.save();
    await EmailFileUpload.findOneAndUpdate(
      { referenceId },
      {
        $set: {
          verifiedBy: userEmailId,
          verifiedAt: moment().utc().toDate(),
          verifiedStatus: true,
        },
      }
    );
    res.status(200).json({ savedJob });
  } catch (error) {
    logger.info({ method: "exportReport", error }, "Error while export report");
    throw new Error(error.message);
  }
};

module.exports = {
  ...commonController,
  scheduleJob,
  getTemplates,
};
