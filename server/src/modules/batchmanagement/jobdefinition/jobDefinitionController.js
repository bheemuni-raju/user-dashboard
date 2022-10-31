const { groupBy, get, sortBy, size, find, extend } = require("lodash");
const Promise = require("bluebird");
const { JobDefinition } = require("@byjus-orders/nexemplum/oms");

const { NotFoundError } = require("../../../lib/errors");
const commonController = require("../../../common/dataController");
const { criteriaBuilder } = require("../../../common/criteriaBuilder");
const batchService = require("../awsBatchService");
const assembler = require("./assembler");

/**
 * List of grid data
 */
const listData = async (req, res) => {
  const {
    page,
    limit,
    sort,
    populate,
    searchCriterias = [],
    contextCriterias = [],
  } = req.body;

  let { filter = {} } = req.body;
  filter =
    size(filter) === 0
      ? criteriaBuilder(searchCriterias, contextCriterias)
      : filter;

  const options = {
    page: page || 1,
    limit: limit || 10,
    sort,
    populate,
    select:
      "jobDefinitionName jobDefinitionArn revision status type createdAt updatedAt containerProperties.image",
  };

  // eslint-disable-next-line no-useless-catch
  try {
    const list = await JobDefinition.paginate(filter, options);
    res.json(list);
  } catch (error) {
    throw error;
  }
};

/**
 * Create a record
 */
const createData = async (req, res) => {
  const bodyParams = req.body;
  try {
    const response =
      (await batchService.registerJobDefinition(bodyParams)) || [];
    if (!response.data) throw Error("Job Definition creation failed");
    const jobDefinitionParams = assembler.convertJobDefinition(
      response.data,
      bodyParams
    );

    await JobDefinition.findOneAndUpdate(
      {
        jobDefinitionName: jobDefinitionParams.jobDefinitionName,
      },
      {
        $set: {
          jobDefinitionName: jobDefinitionParams.jobDefinitionName,
        },
        $addToSet: {
          revisions: [jobDefinitionParams.revision],
        },
      },
      { upsert: true }
    );

    res.json({
      message: "Register job definition success",
    });
  } catch (e) {
    res.status(500).json({
      message: "Register job definition failed",
      error: e,
    });
  }
};

/**
 * Show the current record
 */
const readData = (req, res) => {
  res.json(req.jobDefinition);
};

/**
 * Update record
 */
const updateData = async (req, res) => {
  const jobDefinition = extend(req.jobDefinition, req.body);
  const savedJobDefinition = await jobDefinition.save();
  res.json(savedJobDefinition);
};

/**
 * Delete record
 */
const deleteData = async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  const id = req.jobDefinition._id;

  await JobDefinition.findByIdAndRemove(id);

  res.json(req.jobDefinition);
};

/**
 * Deregister job definition
 */
const deRegister = async (req, res) => {
  const { revision } = req.body;
  const { revisions = [] } = req.jobDefinition;

  const versionInfo = find(revisions, { revision });

  if (!versionInfo) throw new NotFoundError("Revision id not found");

  await batchService.deRegisterJobDefinition({
    jobDefinition: versionInfo.jobDefinitionArn,
  });

  await JobDefinition.findOneAndUpdate(
    {
      "revisions.revision": revision,
    },
    {
      $set: {
        "revisions.$.status": "INACTIVE",
      },
    }
  );

  res.json({
    message: "Job definition revision deleted successfully",
  });
};

const jobDefinitionById = async (req, res, next, id) => {
  if (!id) throw new NotFoundError("message: _id is missing");

  const jobDefinition = await JobDefinition.findById(id);

  if (!jobDefinition) throw new NotFoundError();

  req.jobDefinition = jobDefinition;
  next();
};

const syncWithAws = async (req, res) => {
  const response = (await batchService.listJobDefinitions()) || {};
  const jobDefinitions = get(response, "data.jobDefinitions", []);
  const uniqJobDefinitions = groupBy(jobDefinitions, "jobDefinitionName") || {};
  const jobDefinitionNames = Object.keys(uniqJobDefinitions);

  await Promise.map(jobDefinitionNames, async (name) => {
    const revisions = uniqJobDefinitions[name] || [];
    const sortedRevisions = sortBy(revisions, "revision") || [];
    const latestRevision = sortedRevisions[sortedRevisions.length - 1] || {};
    await JobDefinition.updateOne(
      {
        jobDefinitionName: name,
      },
      {
        $set: {
          ...latestRevision,
        },
      },
      {
        upsert: true,
      }
    );
  });

  return res.json({ message: `Synced successfully` });
};

module.exports = {
  ...commonController,
  readData,
  createData,
  updateData,
  deleteData,
  deRegister,
  listData,
  jobDefinitionById,
  syncWithAws,
};
