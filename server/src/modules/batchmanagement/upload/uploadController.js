const bunyan = require("bunyan");
const { S3 } = require("@byjus-orders/tyrion-plugins");
const { get, extend, camelCase } = require("lodash");
const { UploadTemplate, Job } = require("@byjus-orders/nexemplum/oms");

const config = require("../../../config/environment");
const commonController = require("../../../common/dataController");
const batchJobUtil = require("../awsBatchService");
const { NotFoundError } = require("../../../lib/errors");

const logger = bunyan.createLogger({
  name: "Batch - upload Job controller",
  env: process.env.NODE_ENV,
  serializers: bunyan.stdSerializers,
  src: true,
});

const S3Init = S3.init(config.awsS3.accessKeyId, config.awsS3.secretAccessKey);

/**
 * Create a report template
 */
const createData = async (req, res) => {
  const { name } = req.body;

  if (!name) throw new Error(`name is required.`);

  try {
    const uploadTemplate = new UploadTemplate({
      ...req.body,
      formattedName: camelCase(name),
    });

    const savedTemplate = await uploadTemplate.save();
    res.json(savedTemplate);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Show the current record
 */
const readData = (req, res) => {
  res.json(req.uploadTemplate);
};

/**
 * Update record
 */
const updateData = async (req, res) => {
  const uploadTemplate = extend(req.uploadTemplate, req.body);
  const savedRecord = await uploadTemplate.save();
  res.json(savedRecord);
};

/**
 * Delete record
 */
const deleteData = async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  const id = req.uploadTemplate._id;

  await UploadTemplate.findByIdAndRemove(id);

  res.json(req.uploadTemplate);
};

const scheduleJob = async ({
  userEmailId,
  s3Url,
  uploadedFileType,
  jobName,
  originalFileName,
  uploadAttributes = "",
  orgFormattedName = "byjus",
}) => {
  let jobNameUpdate = jobName;
  const jobDefinitionName =
    process.env.NODE_ENV === "uat" ? "uat-upload-job" : "upload-job";
  try {
    const environmentVars = [
      {
        name: "UPLOAD_TEMPLATE_NAME",
        value: uploadedFileType,
      },
      {
        name: "S3_FILE_URL",
        value: s3Url,
      },
      {
        name: "SCHEDULED_BY",
        value: userEmailId,
      },
      {
        name: "FILE_NAME",
        value: originalFileName,
      },
      {
        name: "UPLOAD_ATTRIBUTES",
        value: uploadAttributes,
      },
      {
        name: "ORG_FORMATTED_NAME",
        value: orgFormattedName,
      },
    ];

    const uploadTemplate = await UploadTemplate.findOne({
      formattedName: uploadedFileType,
    });
    /** If jobName is having space, replace it with _ */
    jobNameUpdate = jobName.replace(/ /g, "_");
    const queueName =
      process.env.NODE_ENV === "uat" ? "uat-common-queue" : "upload-queue";
    const result = await batchJobUtil.submitJob(
      jobNameUpdate,
      queueName,
      jobDefinitionName,
      environmentVars
    );
    const newJob = new Job({
      jobName: jobNameUpdate,
      jobId: result.data.jobId,
      jobDefinition: jobDefinitionName,
      jobParams: environmentVars,
      appCategory: get(uploadTemplate, "appCategory"),
      moduleCategory: get(uploadTemplate, "moduleCategory"),
      templateFormattedName: uploadedFileType,
      scheduledBy: userEmailId,
      scheduledAt: new Date(),
      createdBy: userEmailId,
      createdAt: new Date(),
    });
    const savedJob = await newJob.save();
    return savedJob;
  } catch (error) {
    logger.info({ method: "exportReport", error }, "Error while export report");
    throw new Error(error.message);
  }
};

/**
 * Get the file content using multer and upload the same to AWS S3 and scheule the job using AWS Batch SDK
 * @param {*} req
 * @param {*} res
 */
const uploadData = async (req, res) => {
  try {
    const { file } = req;
    const userEmailId = req.user.email;
    const { orgFormattedName = "byjus" } = req.user;
    // UploadAttributes are extra params passed in environmentVars and expects type as string, use JSON.stringify({}) to pass objects.
    const { uploadedFileType, jobName, uploadAttributes = "" } = req.body;
    if (!file || !uploadedFileType || !jobName) {
      return res
        .status(400)
        .json({ message: "Upload Type, Job Name, CSV file is required" });
    }

    const originalFileName = file.originalname;

    const s3Options = {
      Bucket: "byjus-oms",
      Path: `uploadJob/${uploadedFileType}`,
      files: {
        uploadedFileType: [req.file],
      },
      ACL: "public-read",
    };

    const response = await S3.uploadFiles(
      s3Options,
      ["uploadedFileType"],
      S3Init
    );
    if (response.message === "Doc Upload Successfull") {
      const s3Url = get(response, "uploadedDocs.uploadedFile");
      await scheduleJob({
        userEmailId,
        s3Url,
        uploadedFileType,
        jobName,
        originalFileName,
        uploadAttributes,
        orgFormattedName,
      });
      return res.status(200).json({
        message: "File uploaded successfully!",
        s3Url,
      });
    }
    if (response.message === "upload failed") {
      return res.status(400).json({ message: "failure", response });
    }
    return res.status(500).json({ message: "failure", response });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/**
 * For handling upload data functionality using aws batch jobs
 * actually for doing this JobDefinition entry need to be created
 * @param {*} param0
 */

const templateById = async (req, res, next, id) => {
  if (!id) throw new NotFoundError("message: _id is missing");

  const uploadTemplate = await UploadTemplate.findById(id);

  if (!uploadTemplate) throw new NotFoundError();

  req.uploadTemplate = uploadTemplate;
  next();
};

module.exports = {
  ...commonController,
  createData,
  readData,
  updateData,
  deleteData,
  scheduleJob,
  uploadData,
  templateById,
};
