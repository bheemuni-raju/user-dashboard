const { extend } = require('lodash')
const { City } = require('@byjus-orders/nexemplum/ums')

const {
  NotFoundError, BadRequestError
} = require('../../../lib/errors')
const commonController = require("../../../common/dataController")
const utils = require('../../../lib/utils')

/**
* Create a city`
*/
const createData = async (req, res) => {
  const { city } = req.body


  if (!city) throw new BadRequestError("Invalid Request : Required parameters missing")

  const newCity = new City({
    ...req.body
  })

  const savedCity = await newCity.save()
  res.json(savedCity)
}

/**
 * Show the current city
 */
const readData = (req, res) => {
  res.json(req.city)
}

/**
 * List all City
 */
const listAll = async (req, res) => {
  const cities = await City.find()

  res.json(cities)
}

/**
 * Update a city
 */
const updateData = async (req, res) => {
  const city = extend(req.city, req.body)
  const savedCity = await city.save()

  res.json(savedCity)
}

/** Delete a city*/
const deleteData = async (req, res) => {
  const id = req.city._id

  await City.findByIdAndRemove(id)

  res.json(req.city)
}

const cityById = async (req, res, next, id) => {
  const city = await City.findById(id)

  if (!city) throw new NotFoundError

  req.city = city
  next()
}

module.exports = {
  ...commonController,
  createData,
  readData,
  listAll,
  updateData,
  deleteData,
  cityById
}