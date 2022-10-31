const { get, extend, snakeCase, isEmpty } = require('lodash')
const { Organization } = require('@byjus-orders/nexemplum/ums')
const logger = require('@byjus-orders/byjus-logger').child({ module: 'organizationController' });
const {
    NotFoundError, BadRequestError
} = require('../../../lib/errors')
const commonController = require("../../../common/dataController")
const utils = require('../../../lib/utils')
const { getDiff } = require("../../core/utils/userUtil");
const seqNumberGenerator = require('@byjus-orders/nfoundation/ums/user/seqNumberGenerator');
const { getEmailFromOrgArray } = require("./organizationHelper")



/**
* Create a Organization`
*/
const createData = async (req, res) => {
    const { orgName } = req.body
    if (!orgName) throw new BadRequestError("Invalid Request : Required parameters missing")

    const orgId = await seqNumberGenerator.getOrgId();

    const newOrganization = new Organization({
        ...req.body,
        orgFormattedName: snakeCase(orgName),
        orgId: `ORG-${orgId}`,
        createdBy: req.user ? get(req.user, 'email') : 'system',
        createdAt: new Date(),
        updatedAt: new Date()
    })

    const savedOrganization = await newOrganization.save()
    res.json(savedOrganization)
}

/**
 * Show the current organization
 */
const readData = (req, res) => {
    res.json(req.organization)
}

/**
 * List all Organizations
 */
const listAll = async (req, res) => {
    const organizations = await Organization.find()

    res.json(organizations)
}

/**
 * Update an Organization
 */
const updateData = async (req, res) => {
    let { orgFormattedName, orgId } = req.body;
    const oldData = await Organization.findOne({ orgFormattedName, orgId }).lean();
    const formattedOldData = getFormattedOrgData(oldData);
    const formattedNewData = getFormattedOrgData(req.body);

    const historyLogs = getDiff(formattedOldData, formattedNewData, "appGroup");
    if (!isEmpty(historyLogs)) {
        await Organization.updateOne({ orgFormattedName, orgId }, {
            $set: {
                ...formattedNewData,
                updatedBy: req.user ? get(req.user, 'email') : 'system'
            },
            $push: {
                history: {
                    changes: historyLogs,
                    updatedBy: req.user ? get(req.user, 'email') : 'system',
                    updatedAt: new Date()
                }
            },
        })

    }

    res.json({ ...formattedNewData, message: "Updated Successfully" });
}

const getFormattedOrgData = (record) => {
    let formattedData = {
        fiscalYearStartMonth: get(record, "fiscalYearStartMonth", ""),
        currencyCode: get(record, "currencyCode", ""),
        timeZone: get(record, "timeZone", ""),
        dateFormat: get(record, "dateFormat", ""),
        languageCode: get(record, "languageCode", ""),
        industryType: get(record, "industryType", ""),
        industrySize: get(record, "industrySize", ""),
        portalName: get(record, "portalName", ""),
        orgAddress: get(record, "orgAddress", ""),
        remitToAddress: get(record, "remitToAddress", ""),
        address: get(record, "address", {})
    };

    return formattedData;
}

/** Delete an Organization*/
const deleteData = async (req, res) => {
    const id = req.organization._id

    await Organization.findByIdAndRemove(id)

    res.json(req.organization)
}

const organizationById = async (req, res, next, id) => {
    const organization = await Organization.findById(id)

    if (!organization) throw new NotFoundError

    req.organization = organization
    next()
}

const getOrganizationByIdOrName = async (req, res) => {
    logger.info({ method: "getOrganizationByID", url: req.url }, "getOrganizationByID method initialized");
    const orgId = req.params?.orgId;
    let organization = null
    const { redisClient } = global.byjus;
    try {
        if (redisClient && await redisClient.exists(orgId) == 1) {
            let orgFromRedis = await redisClient.get(orgId)
            logger.info({ method: "getOrganizationByID" }, "data from redis");
            organization = JSON.parse(orgFromRedis)
        } else {
            logger.info({ method: "getOrganizationByID" }, "no redisclient data from DB");
            organization = await Organization.findOne({ $or: [{ 'orgId': orgId }, { 'orgFormattedName': orgId }] });
            if (redisClient) {
                await redisClient.set(orgId, JSON.stringify(organization), 'EX', 120)
            }
        }

        if (!organization) return res.json({ message: 'Organization not found with this orgId or orgFormattedName!' });
        return res.status(200).json(organization);
    } catch (error) {
        logger.error(error, "Error in fetching data from getOrganizationByID");
    }
}

const getSupportedEmails = async (req, res) => {
    logger.info({ method: "getSupportedEmails", url: req.url }, "getSupportedEmails method initialized");
    try {
        const { redisClient } = global.byjus;
        let emails = []
        if (redisClient && await redisClient.exists('orgEmail') == 1) {
            const emailFromRedis = await redisClient.get('orgEmail')
            logger.info({ method: "getSupportedEmails" }, "data from redis");
            emails = JSON.parse(emailFromRedis)
        } else {
            logger.info({ method: "getSupportedEmails" }, "No redis client data from DB");
            const organizations = await Organization.find()
            emails = getEmailFromOrgArray(organizations)
            if (redisClient) {
                await redisClient.set("orgEmail", JSON.stringify(emails), 'EX', 180)
            }
        }

        if (emails.length < 1) {
            emails = ["@byjus.com", "@moreideas.ae", "@ls.moreideas.ae", "@aesl.in", "@tangibleplay.com"]
        }

        return res.status(200).json(emails)
    } catch (error) {
        logger.error(error, "Error in fetching data from getSupportedEmails");
    }
}

module.exports = {
    ...commonController,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    organizationById,
    getOrganizationByIdOrName,
    getSupportedEmails
}