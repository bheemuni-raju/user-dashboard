const bunyan = require("bunyan");
const { get, extend, size, isEmpty } = require("lodash");
const { ReportTemplate, Job } = require("@byjus-orders/nexemplum/oms");
const { ReportCategoryMaster } = require("@byjus-orders/nexemplum/common");
const lmsModels = require("@byjus-orders/nexemplum/lms");
const omsModels = require("@byjus-orders/nexemplum/oms");
const pmsModels = require("@byjus-orders/nexemplum/pms");
const umsModels = require("@byjus-orders/nexemplum/ums");

const { NotFoundError } = require("../../../lib/errors");
const commonController = require("../../../common/dataController");
const { criteriaBuilder } = require("../../../common/criteriaBuilder");
const utils = require("../../../lib/utils");
const batchJobUtil = require("../awsBatchService");
const { groupByModuleCategory } = require("./reportService");
const { BadRequestError } = require("../../../lib/errors");

const logger = bunyan.createLogger({
  name: "Report controller",
  env: process.env.NODE_ENV,
  serializers: bunyan.stdSerializers,
  src: true,
});

const groupByModuleList = async (req, res) => {
  let { filter = {} } = req.body;
  const { searchCriterias = [], contextCriterias = [] } = req.body;
  filter =
    size(filter) === 0
      ? criteriaBuilder(searchCriterias, contextCriterias)
      : filter;

  const stages = [
    {
      $match: {
        ...filter,
      },
    },
    {
      $group: {
        _id: "$moduleCategory",
        reports: {
          $addToSet: {
            name: "$name",
            formattedName: "$formattedName",
            _id: "$_id",
          },
        },
      },
    },
    {
      $addFields: {
        moduleCategory: "$_id",
      },
    },
    {
      $unset: ["_id"],
    },
  ];

  const finalList = await ReportTemplate.aggregate(stages);

  return res.json(finalList);
};

/**
 * Create a report template
 */
const createData = async (req, res) => {
  logger.info({ method: "createData" }, "Request body : ", req.body);

  try {
    const {
      name,
      collectionHeaders,
      databaseName = "",
      connectionType,
    } = req.body;

    if (!collectionHeaders)
      throw new Error(`name, collectionHeaders are required parameters.`);
    const reportTemplate = new ReportTemplate({
      ...req.body,
      databaseName: utils.dbMap[databaseName],
      formattedName: utils.formatName(name),
      connectionType,
    });

    const savedTemplate = await reportTemplate.save();
    logger.info({ method: "createData" }, `Response : ${savedTemplate}`);
    res.json(savedTemplate);
  } catch (error) {
    logger.error(
      { method: "createData" },
      `Failed to create report : ${error.message}`
    );
    throw new Error(error);
  }
};

/**
 * Show the current record
 */
const readData = (req, res) => {
  res.json(req.reportTemplate);
};

/**
 * Update record
 */
const updateData = async (req, res) => {
  const reportTemplate = extend(req.reportTemplate, req.body);
  const savedOrder = await reportTemplate.save();
  res.json(savedOrder);
};

/**
 * Delete record
 */
const deleteData = async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  const id = req.reportTemplate._id;

  await ReportTemplate.findByIdAndRemove(id);

  res.json(req.reportTemplate);
};

const scheduleJob = async (req, res) => {
  logger.info({ method: "scheduleJob" }, "Request body : ", req.body);
  try {
    const {
      reportFormattedName,
      email,
      filters,
      modelName = "",
      tableName,
      dbType = "mongodb",
      gridId = "",
      dbName = "friendly-potato",
      viewFormattedName = null,
      appCategory = ""
    } = req.body;
    let { jobName } = req.body;
    const jobDefinitionName =
      process.env.NODE_ENV === "uat" ? "uat-export-job" : "export-job";

    if (!jobName || !reportFormattedName || !email) {
      return res.status(400).json({ error: "Missing required params" });
    }

    let environmentVars = [];
    let reportTemplate = {
      appCategory
    };

    if (reportFormattedName === "gridReport") {
      environmentVars = [
        {
          name: "SOURCE",
          value: "byjus_grid",
        },
        {
          name: "SCHEDULED_BY",
          value: email,
        },
        // Table name is db collection name.
        {
          name: "TABLE_NAME",
          value: tableName,
        },
        // modelName is collection name.
        {
          name: "MODEL_NAME",
          value: modelName,
        },
        // pass dbName in case of mongo, ex: friendly-potato
        {
          name: "DB_NAME",
          value: dbName,
        },
        // db is postgres or mongodb
        {
          name: "DB_TYPE",
          value: dbType,
        },
        {
          name: "GRID_ID",
          value: gridId,
        },
        {
          name: "VIEW_FORMATTED_NAME",
          value: viewFormattedName
        }
      ];
    } else {
      reportTemplate = await ReportTemplate.findOne({
        formattedName: reportFormattedName,
      });
      environmentVars = [
        {
          name: "REPORT_TEMPLATE_NAME",
          value: reportFormattedName,
        },
        {
          name: "SCHEDULED_BY",
          value: email,
        },
      ];
    }
    if (filters && Object.keys(filters).length > 0) {
      environmentVars.push({
        name: "FILTERS",
        value: JSON.stringify(filters),
      });
    }

    /** If jobName is having space, replace it with _ */
    jobName = jobName.replace(/ /g, "_");
    const queueName =
      process.env.NODE_ENV === "uat" ? "uat-common-queue" : "export-queue";
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
      appCategory: get(reportTemplate, "appCategory", ""),
      moduleCategory: get(reportTemplate, "moduleCategory", ""),
      templateFormattedName: reportFormattedName,
      scheduledBy: get(req, "user.email") || email,
      scheduledAt: new Date(),
      createdBy: get(req, "user.email") || email,
      createdAt: new Date(),
    });
    const savedJob = await newJob.save();
    return res.status(200).json({
      message: "Job submitted success",
      data: savedJob,
    });
  } catch (error) {
    logger.error(
      { method: "exportReport", error },
      "Error while export report"
    );
    return res.status(500).json({ error: error.message });
  }
};

const reportTemplateById = async (req, res, next, id) => {
  if (!id) throw new NotFoundError("message: _id is missing");

  const reportTemplate = await ReportTemplate.findById(id);

  if (!reportTemplate) throw new NotFoundError();

  req.reportTemplate = reportTemplate;
  next();
};

/**
 * Update subscription
 */
const addSubscription = async (req, res) => {
  const { reportTemplate } = req;
  const { email } = req.body;
  if (reportTemplate.subscribers.includes(email)) {
    res.status(500).json({ message: "Email Already Subscribed!" });
  } else {
    reportTemplate.subscribers.push(email);
    const savedOrder = await reportTemplate.save();
    res.status(200).json(savedOrder);
  }
};

const getUniqueValues = async (req, res) => {
  const { filter, collection } = req.body;
  if (Object.keys(utils.CollectionMap).includes(collection)) {
    let model = utils.CollectionMap[collection];
    let uniqueValues = [];
    model =
      lmsModels[model] ||
      omsModels[model] ||
      umsModels[model] ||
      pmsModels[model];
    if (model) {
      uniqueValues = await model.distinct(filter);
    }
    res.status(200).json({ unique: uniqueValues });
  } else {
    res.status(200).json({ unique: [] });
  }
};

// report category master apis
const getReportCategoryPermissions = async (req, res) => {
  let { filter = {} } = req.body;
  const { searchCriterias = [], contextCriterias = [] } = req.body;
  filter =
    size(filter) === 0
      ? criteriaBuilder(searchCriterias, contextCriterias)
      : filter;
  const categoryData = await groupByModuleCategory(filter);
  const stages = [
    {
      $match: {
        ...filter,
        status: "active",
      },
    },
    {
      $unset: ["_id"],
    },
  ];
  const finalList = await ReportCategoryMaster.aggregate(stages);

  categoryData.forEach((category) => {
    const moduleData = finalList.find(
      (x) => x.moduleCategory === category.moduleCategory
    );
    // eslint-disable-next-line no-param-reassign
    category.permissionMap = get(moduleData, "permissionMap", {});
  });

  return res.json(categoryData);
};

const updateDetails = async (req, status) => {
  const { appCategory, moduleCategory, permissionMap, onToggle } = req.body;
  const { orgName } = req.params;

  if (!onToggle) {
    if (isEmpty(appCategory) || isEmpty(moduleCategory))
      throw new BadRequestError(
        "Invalid Request : Required parameters missing"
      );
  }

  const orgFormattedName = get(req, "user.orgFormattedName", "") || orgName;

  const oldData = await ReportCategoryMaster.findOne({
    appCategory,
    moduleCategory,
    orgFormattedName,
  }).lean();

  const getFormattedReportCategoryData = (data) => {
    const formattedData = {
      appCategory: get(data, "appCategory", ""),
      moduleCategory: get(data, "moduleCategory", ""),
      orgFormattedName: get(data, "orgFormattedName", ""),
      permissionMap: get(data, "permissions", []),
      status: get(data, "status", ""),
    };

    return formattedData;
  };

  const formattedOldData = getFormattedReportCategoryData(oldData);

  const formattedNewData = {
    ...formattedOldData,
    ...getFormattedReportCategoryData(req.body),
    status: !isEmpty(status) ? status : get(formattedOldData, "status", ""),
    permissionMap: !isEmpty(permissionMap)
      ? permissionMap
      : get(formattedOldData, "permissionMap", []),
    appCategory: !isEmpty(appCategory)
      ? appCategory
      : get(formattedOldData, "appCategory", ""),
    moduleCategory: !isEmpty(moduleCategory)
      ? moduleCategory
      : get(formattedOldData, "moduleCategory", ""),
    orgFormattedName: !isEmpty(orgFormattedName)
      ? orgFormattedName
      : get(formattedOldData, "orgFormattedName", ""),
  };

  await ReportCategoryMaster.updateOne(
    { appCategory, moduleCategory, orgFormattedName },
    {
      $set: {
        ...formattedNewData,
        updatedBy: req.user ? get(req.user, "email") : "system",
        updatedAt: new Date(),
      },
    }
  );
  return { ...formattedNewData, message: "Updated Successfully" };
};

const updateReportCategory = async (req, res) => {
  const updatedResult = await updateDetails(req, "active");
  res.json(updatedResult);
};

const deleteReportCategory = async (req, res) => {
  const deletedResult = await updateDetails(req, "inactive");
  res.json(deletedResult);
};

const groupByAppAndCategoryList = async (req, res) => {
  let { filter = {} } = req.body;
  const { searchCriterias = [], contextCriterias = [] } = req.body;
  filter =
    size(filter) === 0
      ? criteriaBuilder(searchCriterias, contextCriterias)
      : filter;

  const stages = [
    {
      $match: {
        ...filter,
        status: "active",
      },
    },
    {
      $group: {
        _id: { appCategory: "$appCategory", moduleCategory: "$moduleCategory" },
      },
    },
    {
      $addFields: {
        appCategory: "$_id.appCategory",
        moduleCategory: "$_id.moduleCategory",
      },
    },
    {
      $unset: ["_id"],
    },
  ];

  const finalList = await ReportCategoryMaster.aggregate(stages);

  return res.json(finalList);
};

/**
 * Create Report Category`
 */
const createReportCategory = async (req, res) => {
  const { appCategory, moduleCategory, permissionMap, orgFormattedName } =
    req.body;
  if (isEmpty(appCategory) || isEmpty(moduleCategory))
    throw new BadRequestError("Invalid Request : Required parameters missing");

  const reportCategoryDetails = await ReportCategoryMaster.findOne({
    appCategory,
    moduleCategory,
    orgFormattedName,
  }).lean();
  if (!isEmpty(reportCategoryDetails)) {
    const updatedResult = await updateDetails(req, "active");
    res.json(updatedResult);
  } else {
    const getOrgFormattedName = get(req, "user.orgFormattedName", "");
    const newReportCategory = new ReportCategoryMaster({
      appCategory,
      moduleCategory,
      status: "active",
      permissionMap,
      getOrgFormattedName,
      createdBy: req.user ? get(req.user, "email") : "system",
      createdAt: new Date(),
    });

    const savedReportCategory = await newReportCategory.save();
    res.json(savedReportCategory);
  }
};

module.exports = {
  ...commonController,
  createData,
  readData,
  updateData,
  deleteData,
  scheduleJob,
  reportTemplateById,
  addSubscription,
  getUniqueValues,
  groupByModuleList,
  groupByAppAndCategoryList,
  getReportCategoryPermissions,
  updateReportCategory,
  deleteReportCategory,
  createReportCategory,
};
