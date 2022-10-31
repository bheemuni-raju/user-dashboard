const { extend } = require('lodash')
const { size, get, snakeCase } = require('lodash');
const { TemplatePlaceholder } = require('@byjus-orders/nexemplum/ums')

const {
    NotFoundError, BadRequestError
} = require('../../../../lib/errors');
const { criteriaBuilder } = require('../../../../common/criteriaBuilder');
const commonController = require("../../../../common/dataController")

const listData = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    filter["appName"] = appName;
    filter["orgFormattedName"] = get(req, 'user.orgFormattedName', 'byjus');

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await TemplatePlaceholder.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}


/**
* Create Placeholder`
*/
const createData = async (req, res) => {
    let { name } = req.body;
    if (!name) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newPlaceholder = new TemplatePlaceholder({
        ...req.body,
        name: snakeCase(name),
        formattedName: snakeCase(name),
        orgFormattedName: get(req, 'user.orgFormattedName', 'byjus'),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: get(req, "user.email", "system"),
        updatedBy: get(req, "user.email", "system")
    })

    const savedPlaceholder = await newPlaceholder.save()
    res.json(savedPlaceholder)
}

/**
 * Show the current placeholder
 */
const readData = (req, res) => {
    res.json(req.placeholder)
}

/**
 * List all Placeholders
 */
const listAll = async (req, res) => {
    const placeholders = await TemplatePlaceholder.find();
    res.json(placeholders)
}

/**
 * Update an Placeholder
 */
const updateData = async (req, res) => {
    const placeholder = extend(req.placeholder, req.body)
    const savedPlaceholder = await placeholder.save()
    res.json(savedPlaceholder)
}

/** Delete an Placeholder*/
const deleteData = async (req, res) => {
    const id = req.placeholder._id
    await TemplatePlaceholder.findByIdAndRemove(id)
    res.json(req.placeholder)
}

const placeholderById = async (req, res, next, id) => {
    const placeholder = await TemplatePlaceholder.findById(id)
    if (!placeholder) throw new NotFoundError
    req.placeholder = placeholder
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
    placeholderById
}