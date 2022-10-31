const { get, extend, snakeCase, isEmpty, size } = require('lodash')
const { Organization, OrganizationAddress, OrganizationHistory } = require('@byjus-orders/npgexemplum')
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const { getDiff } = require("../../../core/utils/userUtil");

const listData = async (req, res) => {
    const { page, limit, sort, searchCriterias = [], contextCriterias = [] } = req.body;

    let { filter = {} } = req.body;
    filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "Organization") : filter;
    const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);


    try {
        const options = {
            page: page || 1,
            paginate: limit || 10,
            sort,
            order: sqlOrder,
            where: filter.rootQuery,
        }

        const dataList = await Organization.paginate({
            ...options,
            where: filter.rootQuery,
            include: [
                ...filter.associationQuery,
                { model: OrganizationAddress, as: "orgWithAddress", required: true }
            ],
        });

        res.sendWithMetaData({
            docs: dataList.docs,
            total: dataList.total,
            pages: dataList.pages,
            limit,
            page,
        });
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
};
/**
* Create a Organization`
*/
const createData = async (req, res) => {
    const { orgName } = req.body
    if (!orgName) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newOrganization = new Organization({
        ...req.body,
        status: "active",
        orgFormattedName: snakeCase(orgName),
        createdBy: req.user ? get(req.user, 'email') : 'system',
        createdAt: new Date()
    })

    const savedOrganization = await newOrganization.save()

    let orgData = await Organization.findOne({ where: { orgName } });
    let { id: orgId = "" } = orgData || {};

    const newOrgWithAddress = await OrganizationAddress.create({
        ...req.body,
        orgId,
        createdBy: req.user ? get(req.user, 'email') : 'system',
        createdAt: new Date()
    })
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
    let { orgFormattedName, id } = req.body;
    const oldData = await Organization.findOne({ where: { orgFormattedName } });
    const formattedOldData = getFormattedOrgData(oldData);
    const formattedNewData = getFormattedOrgData(req.body);
    const historyLogs = getDiff(formattedOldData, formattedNewData, "orgFormattedName");

    let orgData = await Organization.findOne({ where: { orgFormattedName } });
    let { id: orgId = "" } = orgData || {};

    if (!isEmpty(historyLogs)) {
        await Organization.update({
            ...req.body,
            status: "active",
            updatedAt: new Date(),
            updatedBy: req.user ? get(req.user, 'email') : 'system'
        }, {
            where: {
                id
            }
        })
        if (oldData.orgFormattedName != orgFormattedName) {
            await OrganizationAddress.create({
                ...req.body,
                orgId: id,
                updatedAt: new Date(),
                updatedBy: req.user ? get(req.user, 'email') : 'system'
            }, {
                where: {
                    orgId
                }
            })
        }
        if (oldData.orgFormattedName == orgFormattedName) {
            await OrganizationAddress.update({
                ...req.body,
                orgId: id,
                updatedAt: new Date(),
                updatedBy: req.user ? get(req.user, 'email') : 'system'
            }, {
                where: {
                    orgId
                }
            })
        }
        // await Promise.map(historyLogs, async data => {
        //     let {entityName=""}
        // })
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
        state: get(record, "state", ""),
        city: get(record, "city", "")
    };

    return formattedData;
}

/** Delete an Organization*/
const deleteData = async (req, res) => {
    const { id } = req.organization;
    await Organization.update({
        status: "inactive",
        updatedAt: new Date(),
        updatedBy: req.user ? get(req.user, 'email') : 'system',
        deletedAt: new Date()
    }, {
        where: {
            id
        }
    });
    await Organization.destroy({ where: { id } })

    res.json(req.organization)
}

const organizationById = async (req, res, next, id) => {
    const organization = await Organization.findOne({ where: { id } })

    if (!organization) throw new NotFoundError

    req.organization = organization
    next()
}

module.exports = {
    ...commonController,
    listData,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    organizationById
}