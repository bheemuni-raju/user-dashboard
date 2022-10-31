const { extend, snakeCase, lowerCase, get, size } = require('lodash')
const { Country, Organization } = require('@byjus-orders/npgexemplum')
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger')

const logger = bunyan('cityController')
const permissionList = require('../../../../lib/permissionList');
const { updateContextCriteriaBasedOnHierarchyPermissions, getOrgId } = require('../utils/hierarchyUtil');

const listData = async (req, res) => {
    const { page, limit, sort, searchCriterias = [], contextCriterias = [] } = req.body;

    let { filter = {} } = req.body;
    filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "Country") : filter;
    const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);


    try {
        const options = {
            page: page || 1,
            paginate: limit || 10,
            sort,
            order: sqlOrder,
            where: filter.rootQuery,
        }

        const dataList = await Country.paginate({
            ...options,
            where: filter.rootQuery,
            include: [
                ...filter.associationQuery,
                { model: Organization, as: "organizationWithCountry", required: true }
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
* Create a country`
*/
const createData = async (req, res) => {
    const { name } = req.body
    let orgName = get(req, "user.orgFormattedName", "");
    let orgId = await getOrgId(orgName);
    if (!name) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newCountry = new Country({
        ...req.body,
        description: req.body ? get(req.body, 'description') : 'null',
        currency: req.body ? get(req.body, 'currency') : 'null',
        timeZone: req.body ? get(req.body, 'timeZone') : 'null',
        formattedName: snakeCase(name),
        status: "active",
        orgId,
        createdAt: new Date(),
        createdBy: req.user ? get(req.user, 'email') : "system"
    })

    const savedCountry = await newCountry.save()

    res.json(savedCountry)
}

/**
 * Show the current country
 */
const readData = (req, res) => {
    res.json(req.country)
}

/**
 * List all Country
 */
const listAll = async (req, res) => {
    const countries = await Country.find()

    res.json(countries)
}

/**
 * Update a country
 */
const updateData = async (req, res) => {
    const { id, name } = req.body;
    const savedCountry = await Country.update({
        ...req.body,
        formattedName: utils.formatName(name),
        status: "active",
        updatedAt: new Date(),
        updatedBy: req.user ? get(req.user, 'email') : 'system'
    }, {
        where: {
            id
        }
    })

    res.json(savedCountry)
    logger.info({ method: 'updateData' }, 'Update a country', JSON.stringify(savedCountry))
}

/** Delete a country*/
const deleteData = async (req, res) => {
    const id = req.country.id
    logger.info({ method: 'deleteData' }, 'Delete a country', id)
    await Country.update({
        status: "inactive",
        updatedAt: new Date(),
        updatedBy: req.user ? get(req.user, 'email') : 'system',
        deletedAt: new Date()
    },
        {
            where: {
                id
            }
        })
    await Country.destroy({ where: { id } })

    res.json(req.country)
}

const countryById = async (req, res, next, id) => {
    const country = await Country.findOne({ where: { id } })

    if (!country) throw new NotFoundError

    req.country = country
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
    countryById
}