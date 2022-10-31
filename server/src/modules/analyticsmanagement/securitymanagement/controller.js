const { size, get, isEmpty } = require("lodash");
const { SecurityReport, Application } = require("@byjus-orders/npgexemplum");
const { S3 } = require("@byjus-orders/tyrion-plugins");

const bunyan = require("../../../lib/bunyan-logger");
const { generateSeqNumber } = require("../../../lib/sequenceNumberGenerator");
const { sqlCriteriaBuilder } = require("../../../common/sqlCriteriaBuilder");
const config = require("../../../config/environment");
const { BadRequestError } = require("../../../lib/errors");

const logger = bunyan("Controller-logger");

const S3Init = S3.init(config.awsS3.accessKeyId, config.awsS3.secretAccessKey);

const listData = async (req, res) => {
  const {
    page,
    limit,
    sort,
    filter = {},
    searchCriterias = [],
    contextCriterias = [],
  } = req.body;
  const sqlFilter =
    size(filter) === 0
      ? sqlCriteriaBuilder(searchCriterias, contextCriterias)
      : filter;

  const sqlOrder = Object.keys(sort).map((item) => {
    return [item, sort[item]];
  });

  try {
    const options = {
      page: page || 1,
      paginate: limit || 10,
      order: sqlOrder,
      where: sqlFilter,
      // attributes
    };

    const list = await SecurityReport.paginate(options);

    res.sendWithMetaData({
      ...list,
      page,
      limit,
    });
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
};

const getDetails = async (req, res) => {
  const { reportId } = req.body;

  try {
    const details = await SecurityReport.findOne({
      where: {
        reportId,
      },
    });

    return res.json(details);
  } catch (error) {
    throw new Error(error);
  }
};

const getAllApplications = async (req, res) => {
  try {
    const details = await Application.findAll();
    if (isEmpty(details)) {
      logger.info("No application present");
      return res.json([]);
    }
    return res.json(details);
  } catch (err) {
    throw new Error(err);
  }
};

const createReport = async (req, res) => {
  const {
    vertical,
    application,
    description,
    reportDateAt,
    reportCuratedBy,
    applicationLeadName,
    reportName,
  } = req.body;
  const createdBy = get(req, "user.email", "");
  const reportId = generateSeqNumber("REP");
  const userEmail = createdBy;

  try {
    const s3Options = {
      Bucket: "byjus-oms",
      Path: `securityReport/${vertical}/${reportName}`,
      files: {
        reportName: [req.file],
      },
      ACL: "public-read",
    };

    const response = await S3.uploadFiles(s3Options, ["reportName"], S3Init);

    if (response.message === "Doc Upload Successfull") {
      const s3Url = get(response, "uploadedDocs.uploadedFile");

      const details = await SecurityReport.create({
        reportId,
        vertical,
        application,
        description,
        reportDateAt,
        reportCuratedBy,
        applicationLeadName,
        reportUrl: s3Url,
        createdAt: new Date(),
        createdBy: userEmail,
        status: "active",
      });
      return res.status(200).json({
        message: "File uploaded successfully!",
        s3Url,
        details,
      });
    }
    if (response.message === "upload failed") {
      return res.status(400).json({ message: "failure", response });
    }
    return res.status(500).json({ message: "failure", response });
  } catch (error) {
    throw new Error(error);
  }
};

const getFormattedReportData = (data) => {
  const formattedData = {
    reportId: get(data, "reportId", ""),
    vertical: get(data, "vertical", ""),
    application: get(data, "application", ""),
    description: get(data, "description", ""),
    reportDateAt: get(data, "reportDateAt", ""),
    reportCuratedBy: get(data, "reportCuratedBy", []),
    applicationLeadName: get(data, "applicationLeadName", []),
    reportUrl: get(data, "reportUrl", []),
    status: get(data, "status", ""),
  };
  return formattedData;
};

const updateDetails = async (req, status) => {
  const {
    vertical,
    application,
    reportDateAt,
    reportCuratedBy,
    applicationLeadName,
    reportId,
    onToggle,
    reportName = "",
    description = "",
  } = req.body;
  if (!onToggle) {
    if (isEmpty(reportId))
      throw new BadRequestError(
        "Invalid Request : Required parameters missing"
      );
  }
  const oldData = await SecurityReport.findOne({ reportId });
  const formattedOldData = getFormattedReportData(oldData);
  const formattedNewData = {
    ...formattedOldData,
    ...getFormattedReportData(req.body),
    status: !isEmpty(status) ? status : get(formattedOldData, "status", ""),
    reportDateAt: !isEmpty(reportDateAt)
      ? reportDateAt
      : get(formattedOldData, "reportDateAt", []),
    reportCuratedBy: !isEmpty(reportCuratedBy)
      ? reportCuratedBy
      : get(formattedOldData, "reportCuratedBy", ""),
    applicationLeadName: !isEmpty(applicationLeadName)
      ? applicationLeadName
      : get(formattedOldData, "applicationLeadName", ""),
    vertical: !isEmpty(vertical)
      ? vertical
      : get(formattedOldData, "vertical", ""),
    application: !isEmpty(application)
      ? application
      : get(formattedOldData, "application", ""),
    description: !isEmpty(description)
      ? description
      : get(formattedOldData, "description", ""),
    reportUrl:
      !isEmpty(status) && status === "inactive"
        ? ""
        : get(formattedOldData, "reportUrl", ""),
  };

  if (req.file && status === "active") {
    const s3Options = {
      Bucket: "byjus-oms",
      Path: `securityReport/${vertical}/${reportName}`,
      files: {
        reportName: [req.file],
      },
      ACL: "public-read",
    };

    const response = await S3.uploadFiles(s3Options, ["reportName"], S3Init);

    if (response.message === "Doc Upload Successfull") {
      const s3Url = get(response, "uploadedDocs.uploadedFile");
      formattedNewData.reportUrl = s3Url;
    }
  }

  await SecurityReport.update(
    {
      ...formattedNewData,
      updatedBy: req.user ? get(req.user, "email") : "system",
      updatedAt: new Date(),
    },
    {
      where: {
        reportId,
      },
    }
  );
  return { details: formattedNewData, message: "Updated Successfully" };
};

const updateReport = async (req, res) => {
  const updatedResult = await updateDetails(req, "active");
  res.json(updatedResult);
};

const deleteReport = async (req, res) => {
  const deletedResult = await updateDetails(req, "inactive");
  res.json(deletedResult);
};

module.exports = {
  listData,
  createReport,
  getDetails,
  updateReport,
  deleteReport,
  getAllApplications,
};
