const { get, extend, lowerCase, size } = require('lodash')
const { City, Organization, Country } = require('@byjus-orders/npgexemplum')
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger')

const logger = bunyan('cityController')

const listData = async (req, res) => {
  const { page, limit, sort , searchCriterias = [], contextCriterias = [] } = req.body;

  let { filter = {} } = req.body;
  filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "City") : filter;
  const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);


  try {
    const options = {
      page: page || 1,
      paginate: limit || 10,
      sort,
      order: sqlOrder,
      where: filter.rootQuery,
    }

    const dataList = await City.paginate({
      ...options,
      where: filter.rootQuery,
      include: [
        ...filter.associationQuery,
        { model: Country, as: "countryWithCity", required: true },
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
* Create a city
*/
const createData = async (req, res) => {
  const { name, country } = req.body;
  let orgName = get(req, "user.orgFormattedName", "");
  let orgId = await getOrgId(orgName);
  logger.info({ method: 'createData' }, 'Create a city', JSON.stringify(req.body))

  try {

    if (!name) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newCity = new City({
      ...req.body,
      name,
      status: "active",
      orgId,
      formattedName: utils.formatName(name),
      countryId: country,
      createdAt: new Date(),
      createdBy: req.user ? get(req.user, 'email') : 'system'
    });

    const savedCity = await newCity.save()
    res.json(savedCity)
  } catch (err) {
    logger.error({ method: 'createData' }, err)
    throw new Error(err)
  }
}

/**
 * Show the current city
 */
const readData = (req, res) => {
  res.json(req.city)
  logger.info({ method: 'readData' }, 'Show the current city', JSON.stringify(req.city))
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
  const { id, name } = req.body;

  const { country } = req.body;
  const savedCity = await City.update({
    ...req.body,
    formattedName: utils.formatName(name),
    status: "active",
    coundtyId: country,
    country_id: country,
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system'
  }, {
    where: {
      id
    }
  });

  res.json(savedCity)
  logger.info({ method: 'updateData' }, 'Update a City', JSON.stringify(savedCity))
}

/** Delete a city*/
const deleteData = async (req, res) => {
  const { id } = req.city;
  logger.info({ method: 'deleteData' }, 'Delete a Campaign', id)
  await City.update({
    status: "inactive",
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system',
    deletedAt: new Date()
  }, {
    where: {
      id
    }
  });
  await City.destroy({ where: { id } });
  res.json(req.city)
}

const cityById = async (req, res, next, id) => {
  const city = await City.findOne({ where: { id } })

  if (!city) throw new NotFoundError

  req.city = city
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
  cityById
}