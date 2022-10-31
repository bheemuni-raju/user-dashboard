const request = require("request-promise");
const Promise = require("bluebird");
const {
  size,
  get,
  upperCase,
  startCase,
  isArray,
  camelCase,
} = require("lodash");
const {
  DevopsInfraRequest,
  DevopsInfraComment,
} = require("@byjus-orders/npgexemplum/common");

const { generateSeqNumber } = require("../../../lib/sequenceNumberGenerator");
const { sqlCriteriaBuilder } = require("../../../common/sqlCriteriaBuilder");
const commonUserController = require("../../../common/dataController");

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

    const list = await DevopsInfraRequest.paginate(options);

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
  const { requestId } = req.body;

  try {
    const details = await DevopsInfraRequest.findOne({
      where: {
        requestId,
      },
      // include: "deploymentRequestComments"
    });

    return res.json(details);
  } catch (error) {
    throw new Error(error);
  }
};

const getComments = async (req, res) => {
  const { requestId } = req.body;

  try {
    const details = await DevopsInfraComment.findAll({
      where: {
        requestId,
      },
    });

    return res.json(details);
  } catch (error) {
    throw new Error(error);
  }
};

const sendSlackNotification = async (params = {}) => {
  const { requestId, userEmail, message } = params;
  const isDev = process.env.NODE_ENV !== "production";

  const emailArray = isArray(userEmail) ? userEmail : userEmail.split(",");
  if (!emailArray.length) return;

  await Promise.map(emailArray, async (emailId) => {
    const reqOptions = {
      uri: process.env.SLACK_DR_WORKFLOW_URL,
      method: "POST",
      body: {
        /* eslint-disable */
        user_email: emailId,
        dr_link: `https://${
          /* eslint-enable */
          isDev ? "dev-" : ""
        }users.byjusorders.com/analytics/devops-infra-requests/${requestId}`,
        message,
      },
      json: true,
    };

    try {
      await request(reqOptions);
      console.log(`Slack notification sent to ${emailId}`);
    } catch (error) {
      console.log(error.error);
    }
  });
};

const addComment = async (req, res) => {
  const { requestId, comment = "", taggedEmail } = req.body;
  const updatedByEmail = get(req, "user.email", "");

  if (!comment) throw new Error(`comment is required.`);

  const newComment = await DevopsInfraComment.create({
    requestId,
    comment,
    commentedBy: updatedByEmail,
    commentedAt: new Date(),
  });

  const userComment = `You have been tagged by ${updatedByEmail} on a comment made on deployment request - ${requestId}
    Comment - ${comment}`;

  sendSlackNotification({
    requestId,
    userEmail: taggedEmail,
    alternateEmail: "",
    message: userComment,
  });
  return res.json(newComment);
};

const getOperationConfig = (params = {}) => {
  const { status, updatedByEmail, requestId, team, application } = params;

  const operationConfigMap = {
    created: {
      message: `The deployment request-${requestId} for ${upperCase(
        application
      )} is created by ${updatedByEmail} from ${startCase(
        team
      )} team. Please click on the below link to check and provide approval/rejection.`,
    },
    approved: {
      message: ` The deployment request-${requestId} for ${upperCase(
        application
      )} is approved by ${updatedByEmail}.Please proceed with deployment.`,
    },
    rejected: {
      message: `The deployment request-${requestId} for ${upperCase(
        application
      )} is rejected by ${updatedByEmail}.`,
    },
    hold: {
      message: `The deployment request-${requestId} for ${upperCase(
        application
      )} is hold by ${updatedByEmail}.`,
    },
    // eslint-disable-next-line camelcase
    in_progress: {
      message: `The deployment request-${requestId} for ${upperCase(
        application
      )} is marked as in_progress by ${updatedByEmail}.`,
    },
    deployed: {
      message: `The deployment request-${requestId} for ${upperCase(
        application
      )} is deployed by ${updatedByEmail}. Please proceed with smoke testing as per the release notes and provide the feedback.`,
    },
    // eslint-disable-next-line camelcase
    smoke_tested: {
      message: `The deployment request-${requestId} for ${upperCase(
        application
      )} is smoke tested by ${updatedByEmail}.`,
    },
  };

  return operationConfigMap[status];
};

const createRequest = async (req, res) => {
  const {
    team,
    application,
    assignedTo,
    serviceRequested = "",
    description,
    repositoryLink,
    environment,
    toBeApprovedBy,
    toBeDeployedBy,
    toBeSmokeTestedBy,
  } = req.body;
  const updatedByEmail = get(req, "user.email", "");

  /** Multiple emails will be sent as comma seperated */
  const userEmail =
    process.env.NODE_ENV === "production" ? assignedTo : updatedByEmail;
  try {
    const requestId = generateSeqNumber("DR");
    const details = await DevopsInfraRequest.create({
      requestId,
      team,
      application,
      presentOwner: userEmail,
      environment,
      assignedBy: "system",
      assignedAt: new Date(),
      serviceRequested,
      description,
      repositoryLink,
      createdAt: new Date(),
      createdBy: updatedByEmail,
      status: "created",
      toBeApprovedBy,
      toBeDeployedBy,
      toBeSmokeTestedBy, // getting it added to assign accordingly
    });

    if (assignedTo === updatedByEmail) {
      const status = "approved";
      await DevopsInfraRequest.update(
        {
          presentOwner: userEmail,
          status,
          assignedBy: "system",
          assignedAt: new Date(),
          [`${camelCase(status)}At`]: new Date(),
          [`${camelCase(status)}By`]: updatedByEmail,
          smokeTestedStatus: "",
          previousStatus: null,
        },
        {
          where: {
            requestId: details.requestId,
          },
        }
      );

      await DevopsInfraComment.create({
        requestId: details.requestId,
        comment: "Approved",
        commentedBy: updatedByEmail,
        commentedAt: new Date(),
      });
    } else {
      const operationConfig = getOperationConfig({
        status: "created",
        updatedByEmail,
        team,
        application,
        assignedTo,
        requestId: details.requestId,
      });
      sendSlackNotification({
        requestId,
        userEmail,
        message: operationConfig.message,
      });
    }

    return res.json(details);
  } catch (error) {
    throw new Error(error);
  }
};

const updateRequestStatus = async (req, res) => {
  const {
    requestId,
    assignedTo,
    previousStatus,
    status,
    team,
    application,
    remark,
    createdBy,
    smokeTestedStatus,
  } = req.body;
  const updatedByEmail = get(req, "user.email", "");

  const operationConfig = getOperationConfig({
    status,
    updatedByEmail,
    requestId,
    team,
    application,
    assignedTo,
  });
  /** Multiple emails will be sent as comma seperated */
  let userEmail =
    process.env.NODE_ENV === "production" ? assignedTo : updatedByEmail;

  let extraFilter = {};
  if (status === "rejected") {
    extraFilter = {
      approvedBy: "",
      deployedBy: "",
      smokeTestedBy: "",
    };
  }
  try {
    const details = await DevopsInfraRequest.update(
      {
        presentOwner: userEmail,
        status,
        assignedBy: "system",
        assignedAt: new Date(),
        [`${camelCase(status)}At`]: new Date(),
        [`${camelCase(status)}By`]: updatedByEmail,
        smokeTestedStatus: smokeTestedStatus || "",
        previousStatus,
        ...extraFilter,
      },
      {
        where: {
          requestId,
        },
      }
    );

    await DevopsInfraComment.create({
      requestId,
      comment: remark,
      commentedBy: updatedByEmail,
      commentedAt: new Date(),
    });

    if (["hold", "in_progress"].includes(status)) {
      userEmail = createdBy;
    }

    sendSlackNotification({
      requestId,
      userEmail,
      message: operationConfig.message,
    });
    return res.json(details);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  ...commonUserController,
  listData,
  createRequest,
  getDetails,
  getComments,
  addComment,
  updateRequestStatus,
};
