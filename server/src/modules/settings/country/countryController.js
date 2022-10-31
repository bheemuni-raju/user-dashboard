const { extend, snakeCase } = require('lodash')
const { Country } = require('@byjus-orders/nexemplum/ums')

const {
    NotFoundError, BadRequestError
} = require('../../../lib/errors')
const commonController = require("../../../common/dataController")
const utils = require('../../../lib/utils')

/**
* Create a country`
*/
const createData = async (req, res) => {
    const { name } = req.body

    if (!name) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newCountry = new Country({
        ...req.body,
        formattedName: snakeCase(name)
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
    const country = extend(req.country, req.body)
    const savedCountry = await country.save()

    res.json(savedCountry)
}

/** Delete a country*/
const deleteData = async (req, res) => {
    const id = req.country._id

    await Country.findByIdAndRemove(id)

    res.json(req.country)
}

const countryById = async (req, res, next, id) => {
    const country = await Country.findById(id)

    if (!country) throw new NotFoundError

    req.country = country
    next()
}

module.exports = {
    ...commonController,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    countryById
}