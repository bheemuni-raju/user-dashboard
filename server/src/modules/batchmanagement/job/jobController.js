const { extend, get, size } = require("lodash");
const uuid = require("uuid");
const { Job, JobDefinition } = require("@byjus-orders/nexemplum/oms");
const mongoose = require("mongoose");

const { NotFoundError } = require("../../../lib/errors");
const commonController = require("../../../common/dataController");
const batchService = require("../awsBatchService");
const { criteriaBuilder } = require("../../../common/criteriaBuilder");
const bunyan = require("../../../lib/bunyan-logger");

const logger = bunyan("jobController");

/**
 * Create a record
 */
const createData = async (req, res) => {
  logger.info({ method: "createData" }, "Request body : ", req.body);
  try {
    const job = new Job({
      ...req.body
    });
    const savedJob = await job.save();
    logger.info({ method: "createData" }, `Response : ${savedJob}`);
    res.json(savedJob);
  } catch (err) {
    logger.error(
      { method: "createData" },
      `Error in saving job : ${err.message}`
    );
    res.status(500).json({
      error: err
    });
  }
};

/**
 * Show the current record
 */
const readData = (req, res) => {
  res.json(req.job);
};

/**
 * Update record
 */
const updateData = async (req, res) => {
  const job = extend(req.job, req.body);
  const savedJob = await job.save();
  res.json(savedJob);
};

/**
 * Delete record
 */
const deleteData = async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  const id = req.job._id;

  await Job.findByIdAndRemove(id);

  res.json(req.job);
};

const jobById = async (req, res, next, id) => {
  if (!id) throw new NotFoundError("message: _id is missing");

  const job = await Job.findById(id);

  if (!job) throw new NotFoundError();

  req.job = job;
  next();
};

const getLogs = async (req, res) => {
  logger.info({ method: "getLogs" }, "Request body : ", req.body);

  try {
    const { jobId, nextToken } = req.body;
    const job = await Job.findOne({ jobId }).lean();
    const logStreamName =
      get(job, "batchResponse.detail.container.logStreamName") ||
      "achieve-oms-user-migration-job/default/ff6babb7-4e53-4946-8cd0-9f2123f800b7";
    const logs = await batchService.getCloudWatchLogs(logStreamName, nextToken);
    logs?.data?.events?.map(event => {
      const updatedEvent = { ...event, id: uuid() };
      return updatedEvent;
    });
    logger.info({ method: "getLogs" }, `Response : ${logs}`);
    res.json({
      message: "Successfully got the Batch job logs",
      logs
    });
  } catch (e) {
    logger.error({ method: "getLogs" }, `Error in getting logs : ${e.message}`);
    res.status(500).json({
      message: "Fetching logs for job failed",
      error: e
    });
  }
};

const submitJob = async (req, res) => {
  logger.info({ method: "submitJob" }, "Request body : ", req.body);

  try {
    const { jobName, jobQueue, jobDefinitionName, jobDefinitionArn } = req.body;
    const jobDetails = await JobDefinition.findOne({
      jobDefinitionName,
      jobDefinitionArn
    }).lean();

    if (!jobDetails) throw new Error(`JobDetaiils not found for ${jobName}`);

    const { containerProperties } = jobDetails;
    const { environment } = containerProperties || {};
    const submitResponse = await batchService.submitJob(
      jobName,
      jobQueue,
      jobDefinitionName,
      environment
    );
    const jobData = submitResponse.data;

    const newJob = new Job({
      ...req.body,
      // jobParams: environment,
      jobDefinition: jobDefinitionName,
      ...jobData
    });
    const savedJob = await newJob.save();
    logger.info({ method: "submitJob" }, `Response: ${savedJob}`);
    res.send(savedJob);
  } catch (error) {
    logger.error(
      { method: "submitJob" },
      `Error while submitting job : ${error.message}`
    );
    throw new Error(error);
  }
};

const listData = async (req, res) => {
  logger.info({ method: "listData" }, "Request body : ", req.body);

  // eslint-disable-next-line no-useless-catch
  try {
    const {
      page,
      limit,
      model,
      sort,
      populate,
      searchCriterias = [],
      contextCriterias = [],
      db
    } = req.body;

    let { filter = {} } = req.body;

    filter =
      size(filter) === 0
        ? criteriaBuilder(searchCriterias, contextCriterias)
        : filter;

    const select = [
      "jobStatus",
      "jobName",
      "jobId",
      "jobDefinition",
      "scheduledBy",
      "createdAt",
      "updatedAt",
      "output",
      "templateFormattedname"
    ];

    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select
    };
    let ModelName = mongoose.models[model];

    if (!ModelName && db) {
      ModelName = mongoose[db] && mongoose[db].models[model];
    }

    const list = await ModelName.paginate(filter, options);
    logger.info({ method: "listData" }, `Response : ${list}`);
    res.sendWithMetaData(list);
  } catch (error) {
    logger.error(
      { method: "listData" },
      `Failed to fetch grid data : ${error.message}`
    );
    throw error;
  }
};

module.exports = {
  ...commonController,
  createData,
  readData,
  updateData,
  deleteData,
  jobById,
  getLogs,
  submitJob,
  listData
};
