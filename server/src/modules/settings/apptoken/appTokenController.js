const { extend } = require('lodash')
const { size, get } = require('lodash');
const { AppToken } = require('@byjus-orders/nexemplum/ums')

const {
  NotFoundError, BadRequestError
} = require('../../../lib/errors');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController")
const utils = require('../../../lib/utils')
const logger = require('@byjus-orders/byjus-logger').child({ module: 'appTokenController'});

const listData = async (req, res) => {
  logger.info({method:"listData", url: req.url}, "Apptoken listData method initialized");
  let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
  filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select
    }

    const list = await AppToken.paginate(filter, options)
    res.sendWithMetaData(list);
  } catch (error) {
    logger.error(error, "Error in fetching data from Apptoken listData method");
    throw new Error(error || "Error in fetching data");
  }
}


/**
* Create App Token`
*/
const createData = async (req, res) => {
  const { name } = req.body


  if (!name) throw new BadRequestError("Invalid Request : Required parameters missing")

  const newAppToken = new AppToken({
    ...req.body
  })

  const savedAppToken = await newAppToken.save()

  res.json(savedAppToken)
}

/**
 * Show the current App Token
 */
const readData = (req, res) => {
  res.json(req.appToken)
}

/**
 * List all App Tokens
 */
const listAll = async (req, res) => {
  const appTokens = await AppToken.find();

  res.json(appTokens)
}

/**
 * Update an App Token
 */
const updateData = async (req, res) => {
  const appToken = extend(req.appToken, req.body)
  const savedAppToken = await appToken.save()
  res.json(savedAppToken)
}

/** Delete an App Token*/
const deleteData = async (req, res) => {
  const id = req.appToken._id

  await AppToken.findByIdAndRemove(id)

  res.json(req.appToken)
}

const appTokenById = async (req, res, next, id) => {
  const appToken = await AppToken.findById(id)

  if (!appToken) throw new NotFoundError

  req.appToken = appToken
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
  appTokenById
}