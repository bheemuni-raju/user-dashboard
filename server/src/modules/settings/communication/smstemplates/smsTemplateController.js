const { extend } = require('lodash')
const { size, get, snakeCase, isEmpty } = require('lodash');
const { UmsSmsTemplate, TemplatePlaceholder } = require('@byjus-orders/nexemplum/ums')
const Promise = require('bluebird');
const seqNumberGenerator = require('@byjus-orders/nfoundation/ums/user/seqNumberGenerator');
const { sendPersonalizedEmail } = require('../../../../lib/sendMail');
const emailHelper = require('../helper/emailHelper');

const {
    NotFoundError, BadRequestError
} = require('../../../../lib/errors');
const { criteriaBuilder } = require('../../../../common/criteriaBuilder');
const commonController = require("../../../../common/dataController");

const listData = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    filter["appName"] = appName;
    filter["orgFormattedName"] = get(req, 'user.orgFormattedName', 'byjus');
    filter["status"] = { "$nin": ["soft_deleted"] };

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await UmsSmsTemplate.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

/**
* Create SMS Template`
*/
const createData = async (req, res) => {
    const { name, content, placeholders = [], appName } = req.body
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    if (!name && !content) throw new BadRequestError("Invalid Request : Required parameters missing");
    if (content.trim() === orgFormattedName.toUpperCase()) throw new BadRequestError("SMS Content cannot be empty");

    let invalidPlaceholders = await validateTemplatePlaceholders(placeholders);
    if (!isEmpty(invalidPlaceholders)) throw new BadRequestError("Invalid Placeholders: " + invalidPlaceholders.join());

    let existingTemplate = await UmsSmsTemplate.findOne({
        formattedName: snakeCase(name),
        orgFormattedName,
        appName
    });

    let existingStatus = get(existingTemplate, "status", "");

    if (existingStatus === "soft_deleted") {
        let { templateId, orgFormattedName, appName, actionDetails } = existingTemplate;
        actionDetails["activatedAt"] = new Date();
        actionDetails["activatedBy"] = get(req, "user.email", "system");
        actionDetails["updatedAt"] = new Date();
        actionDetails["updatedBy"] = get(req, "user.email", "system");

        await UmsSmsTemplate.updateOne({
            templateId,
            orgFormattedName,
            appName
        }, {
            $set: {
                ...req.body,
                status: "created",
                senderIds: [],
                actionDetails
            }
        });

        res.json(req.body);
    }
    else if (existingStatus === "deactivated") {
        throw new BadRequestError("An entry with the deactivated status already exists");
    }
    else {
        if (isEmpty(existingTemplate)) {
            const templateId = await seqNumberGenerator.getSmsTemplateId();
            const newSmsTemplate = new UmsSmsTemplate({
                ...req.body,
                templateId: `TEMP-${templateId}`,
                formattedName: snakeCase(name),
                orgFormattedName,
                status: "created",
                actionDetails: {
                    createdAt: new Date(),
                    createdBy: get(req, "user.email", "system"),
                    updatedAt: new Date(),
                    updatedBy: get(req, "user.email", "system")
                }
            });

            const savedSmsTemplate = await newSmsTemplate.save()
            res.json(savedSmsTemplate);
        }
        else {
            throw new BadRequestError("Template with the same name already exists");
        }
    }
}

const validateTemplatePlaceholders = async (placeholders) => {
    let invalidPlaceholders = [];

    await Promise.map(placeholders, async (key) => {
        const placeholderDetails = await TemplatePlaceholder.findOne({ name: key });
        if (isEmpty(placeholderDetails)) {
            invalidPlaceholders.push(key);
        }
    })

    return invalidPlaceholders;
}

/**
 * Show the current SMS Template
 */
const readData = (req, res) => {
    res.json(req.smsTemplate)
}

/**
 * List all App Tokens
 */
const listAll = async (req, res) => {
    const smsTemplates = await UmsSmsTemplate.find();
    res.json(smsTemplates)
}

/**
 * Update an SMS Template
 */
const updateData = async (req, res) => {
    const { placeholders = [], status = "", content = "", actionDetails = {}, templateId = "", appName = "", orgFormattedName = "", activeProviders = [] } = req.body

    if (status != "deactivated") {
        if (content.trim() === orgFormattedName.toUpperCase()) throw new BadRequestError("SMS Content cannot be empty");

        if (isEmpty(activeProviders)) throw new BadRequestError("Provider is required");

        let invalidPlaceholders = await validateTemplatePlaceholders(placeholders);
        if (!isEmpty(invalidPlaceholders)) throw new BadRequestError("Invalid Placeholders: " + invalidPlaceholders.join());

        req.body["status"] = status === "created" ? status : "pending";
        actionDetails["updatedAt"] = new Date();
        actionDetails["updatedBy"] = get(req, "user.email", "system");

        if (status !== "created") {
            actionDetails["pendingAt"] = new Date();
            actionDetails["pendingBy"] = get(req, "user.email", "system");
        }

        req.body["actionDetails"] = actionDetails;

        const smsTemplate = extend(req.smsTemplate, req.body)
        const savedSmsTemplate = await smsTemplate.save()
        res.json(savedSmsTemplate)
    }
    else {

        actionDetails["approvedAt"] = new Date();
        actionDetails["approvedBy"] = get(req, "user.email", "");
        await UmsSmsTemplate.updateOne({
            templateId,
            appName,
            orgFormattedName,
            status: 'deactivated'
        }, {
            $set: {
                status: 'approved',
                actionDetails
            }
        });

        res.json(req.smsTemplate);
    }
}

/** Delete an SMS Template*/
const deleteData = async (req, res) => {
    let { _id: id, status, actionDetails } = req.smsTemplate;
    let updateCondition = {};

    if (status !== "approved") {
        actionDetails["softdeletedAt"] = new Date();
        actionDetails["softdeletedBy"] = get(req, "user.email", "");

        updateCondition = {
            status: "soft_deleted",
            actionDetails
        }
    }
    else {
        actionDetails["deactivatedAt"] = new Date();
        actionDetails["deactivatedBy"] = get(req, "user.email", "");

        updateCondition = {
            status: "deactivated",
            actionDetails
        }
    }

    if (!isEmpty(updateCondition)) {
        await UmsSmsTemplate.updateOne({ _id: id }, updateCondition);
    }

    res.json(req.smsTemplate)
}

const smsTemplateById = async (req, res, next, id) => {
    let appName = get(req, "headers.x-app-origin", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    const smsTemplate = await UmsSmsTemplate.findOne({ templateId: id, appName, orgFormattedName });
    if (!smsTemplate) throw new NotFoundError
    req.smsTemplate = smsTemplate
    next()
}

/** Associate sender Ids with particular SMS template */
const associateSender = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    const { templateId, senderIds } = req.body;

    if (isEmpty(senderIds)) throw new BadRequestError("SenderIds cannot be empty");

    let templateDetails = await UmsSmsTemplate.findOne({ templateId, appName, orgFormattedName });
    let { status: templateStatus = "", actionDetails = {} } = templateDetails;

    if (["created", "pending"].includes(templateStatus)) {
        actionDetails["updatedAt"] = new Date();
        actionDetails["updatedBy"] = get(req, "user.email", "system");
        actionDetails["pendingAt"] = new Date();
        actionDetails["pendingBy"] = get(req, "user.email", "system");

        await UmsSmsTemplate.updateOne({ templateId }, {
            $set: {
                senderIds,
                status: "pending",
                actionDetails
            }
        });

        res.json(templateId);
    }
    else {
        throw new BadRequestError("Template Status should be in Created or Pending state for Sender Association");
    }
}

/** Send a particular Sms Template for DLT Approval */
const sendForDLTApproval = async (req, res) => {
    const { templateId } = req.params;
    let appName = get(req, "headers.x-app-origin", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    let templateDetails = await UmsSmsTemplate.findOne({ templateId, appName, orgFormattedName });
    let { status: templateStatus = "", actionDetails = {} } = templateDetails;

    if (templateStatus === "pending") {
        let requestingUser = get(req, "user.email", "system");
        await sendApprovalEmail(templateDetails, requestingUser);

        actionDetails["sentForApprovalAt"] = new Date();
        actionDetails["sentForApprovalBy"] = get(req, "user.email", "system");
        await UmsSmsTemplate.updateOne({ templateId }, {
            $set: {
                status: "sent_for_approval",
                actionDetails
            }
        });

        res.json(templateId);
    }
    else {
        throw new BadRequestError("Please associate atleast one sender id with the SMS template before sending for DLT Approval");
    }
}

const sendApprovalEmail = async (templateDetails, requestingUser) => {
    let toEmails = [requestingUser];
    if (process.env.NODE_ENV === "production") {
        toEmails = ["lokesh@byjus.com", "sujeet.kumar@byjus.com", requestingUser];
    }

    var today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).split(' ').join('-');

    const subject = `SMS Templates approval(${today})`;
    const emailContent = emailHelper.getEmailContent(templateDetails);
    await sendPersonalizedEmail('optech@byjus.com', toEmails, subject, emailContent);
}

/** Mark an SMS Template as Approved after DLT registration approval */
const markApproved = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    const { templateId, dltTemplateId, activeProviders } = req.body;

    let templateDetails = await UmsSmsTemplate.findOne({ templateId, appName, orgFormattedName });
    let { status: templateStatus = "", actionDetails = {} } = templateDetails;

    actionDetails["approvedAt"] = new Date();
    actionDetails["approvedBy"] = get(req, "user.email", "system");
    actionDetails["dltTemplateId"] = dltTemplateId;

    if (templateStatus === "sent_for_approval") {
        await UmsSmsTemplate.updateOne({ templateId }, {
            $set: {
                status: "approved",
                activeProviders,
                actionDetails
            }
        });
    } else {
        throw new BadRequestError("Template Status should be in Sent For Approval state for marking as Approved");
    }

    res.json(templateId);
}

/** Mark an SMS Template as Rejected after DLT registration rejection */
const markRejected = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    const { templateId, rejectedReason } = req.body;

    let templateDetails = await UmsSmsTemplate.findOne({ templateId, appName, orgFormattedName });
    let { status: templateStatus = "", actionDetails = {} } = templateDetails;

    if (templateStatus === "sent_for_approval") {
        actionDetails["rejectedAt"] = new Date();
        actionDetails["rejectedBy"] = get(req, "user.email", "system");
        actionDetails["rejectedReason"] = rejectedReason;

        await UmsSmsTemplate.updateOne({ templateId }, {
            $set: {
                status: "rejected",
                actionDetails
            }
        });
    }
    else {
        throw new BadRequestError("Template Status should be in Sent For Approval state for marking as Rejected");
    }

    res.json(templateId);
}

module.exports = {
    ...commonController,
    listData,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    smsTemplateById,
    associateSender,
    sendForDLTApproval,
    markApproved,
    markRejected
}