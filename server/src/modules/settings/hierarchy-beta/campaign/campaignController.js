const { get, size, isEmpty,first } = require('lodash')
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const { Campaign, Department, SubDepartment } = require('@byjus-orders/npgexemplum');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger')
const permissionList = require('../../../../lib/permissionList');
const logger = bunyan('campaignController')
const { getOrgId } = require('../utils/hierarchyUtil');

const listData = async (req, res) => {
  const { page, limit, sort , searchCriterias = [], contextCriterias = [] } = req.body;

  let { filter = {} } = req.body;
  filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "Campaign") : filter;
  const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);


  try {
    const options = {
      page: page || 1,
      paginate: limit || 10,
      sort,
      order: sqlOrder,
      where: filter.rootQuery,
    }

    const dataList = await Campaign.paginate({
      ...options,
      where: filter.rootQuery,
      include: [
        ...filter.associationQuery,
        { model: Department, as: "departmentWithCampaign", required: true },
        { model: SubDepartment, as: "subdepartmentWithCampaign", required: true },
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
 * Create a Campaign
 */
const createData = async (req, res) => {
  let orgName = get(req, "user.orgFormattedName", "");
  let orgId = await getOrgId(orgName);
  const { name, department, subDepartment } = req.body
  logger.info({ method: 'createData' }, 'Create a campaign', JSON.stringify(req.body))

  try {
    if (!name || !department || !subDepartment) throw new Error('Parameters missing');

    const newCampaign = new Campaign({
      ...req.body,
      status: "active",
      orgId,
      formattedName: utils.formatName(name),
      departmentId: department,
      subdepartmentId: subDepartment,
      createdAt: new Date(),
      createdBy: req.user ? get(req.user, 'email') : 'system'
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
  const { id, department, subDepartment } = req.body
  let subDeptData = await SubDepartment.findOne({ where: { id: subDepartment, departmentId: department } })

  if (isEmpty(subDeptData)) {
    logger.error({ method: 'Vertical: updateData' }, 'Invalid Request : Required parameters missing')
    throw new BadRequestError('Invalid Request : Required parameters missing')
  }
  else {

    const savedCampaign = await Campaign.update({
      ...req.body,
      departmentId: department,
      department_id: department,
      subdepartmentId: subDepartment,
      subdepartment_id: subDepartment,
      updatedAt: new Date(),
      updatedBy: req.user ? get(req.user, 'email') : 'system'
    }, {
      where: {
        id
      }
    });

    res.json(savedCampaign)
    logger.info({ method: 'updateData' }, 'Update a Campaign', JSON.stringify(savedCampaign))
  }
}

/** Delete a campaign*/
const deleteData = async (req, res) => {
  const id = req.campaign.id
  logger.info({ method: 'deleteData' }, 'Delete a Campaign', id)
  await Campaign.update({
    status: "inactive",
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system',
    deletedAt: new Date()
  }, {
    where: {
      id
    }
  });
  await Campaign.destroy({ where: { id } });
  res.json(req.campaign)
}

const campaignById = async (req, res, next, id) => {
  const campaign = await Campaign.findOne({ where: { id } });
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
