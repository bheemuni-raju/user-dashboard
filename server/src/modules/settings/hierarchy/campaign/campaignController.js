const { extend, get, size, isEmpty } = require('lodash')
const { Campaign, Department, SubDepartment } = require('@byjus-orders/nexemplum/ums');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger')
const { criteriaBuilder } = require('../../../../common/criteriaBuilder')

const logger = bunyan('campaignController')
const permissionList = require('../../../../lib/permissionList');
const { updateContextCriteriaBasedOnHierarchyPermissions } = require('../utils/hierarchyUtil');

const listData = async (req, res) => {
  const user = req.user;
  let userPermissions = req.user.permissions;
  let hierarchyBasedPermissions = get(permissionList, 'hierarchy', {});
  let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
  contextCriterias = updateContextCriteriaBasedOnHierarchyPermissions(userPermissions, hierarchyBasedPermissions, contextCriterias, "departmentFormattedName");
  filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select
    }

    const list = await Campaign.paginate(filter, options)
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

/**
 * Create a Campaign
 */
const createData = async (req, res) => {
  const { name, department, subDepartment } = req.body
  logger.info({ method: 'createData' }, 'Create a campaign', JSON.stringify(req.body))

  try {
    if (!name || !department || !subDepartment) throw new Error('Parameters missing');

    const newCampaign = new Campaign({
      ...req.body,
      formattedName: name,
      departmentFormattedName: !isEmpty(department) ? department : "",
      subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""
    })

    const savedCampaign = await newCampaign.save()
    res.json(savedCampaign)
  }
  catch (err) {
    logger.error({ method: 'createData' }, err)
    throw new Error(err)
  }
}

/**
 * Show the current Campaign
 */
const readData = (req, res) => {
  res.json(req.campaign)
  logger.info({ method: 'readData' }, 'Show the current Campaign', JSON.stringify(req.campaign))
}

/**
 * List all Campaigns
 */
const listAll = async (req, res) => {
  const campaigns = await Campaign.find()
  res.json(campaigns)
}

/**
 * Update a campaign
 */
const updateData = async (req, res) => {
  const { department, subDepartment } = req.body

  let updatedBody = {
    ...req.body,
    departmentFormattedName: !isEmpty(department) ? department : "",
    subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""
  }
  const campaign = extend(req.campaign, updatedBody)
  const savedCampaign = await campaign.save()
  res.json(savedCampaign)
  logger.info({ method: 'updateData' }, 'Update a Campaign', JSON.stringify(savedCampaign))
}

/** Delete a campaign*/
const deleteData = async (req, res) => {
  const id = req.campaign._id
  logger.info({ method: 'deleteData' }, 'Delete a Campaign', id)

  await Campaign.findByIdAndRemove(id)

  res.json(req.campaign)
}

const campaignById = async (req, res, next, id) => {
  const campaign = await Campaign.findById(id)

  if (!campaign) throw new NotFoundError

  req.campaign = campaign
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
  campaignById
}
