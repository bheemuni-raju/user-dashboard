const { extend, get, size, isEmpty } = require('lodash')
const { Vertical, Department, SubDepartment } = require('@byjus-orders/nexemplum/ums');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger')
const { criteriaBuilder } = require('../../../../common/criteriaBuilder')

const logger = bunyan('VerticalController')
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

    const list = await Vertical.paginate(filter, options)
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

/**
 *  Create a Vertical 
 */
const createData = async (req, res) => {
  const { name, department, subDepartment } = req.body
  logger.info({ method: 'createData' }, 'Create a Vertical', JSON.stringify(req.body))

  try {
    (!name || !department || !subDepartment)
  }
  catch (err) {
    logger.error({ method: 'createData' }, 'Invalid Request : Required parameters missing', err)
    throw new BadRequestError('Invalid Request : Required parameters missing')
  }

  const newVertical = new Vertical({
    ...req.body,
    departmentFormattedName: !isEmpty(department) ? department : "",
    subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""
  })

  const savedVertical = await newVertical.save()
  res.json(savedVertical)
}

/**
 * Show the current vertical
 */
const readData = (req, res) => {
  res.json(req.vertical)
  logger.info({ method: 'readData' }, 'Show the current vertical', JSON.stringify(req.vertical))
}

/**
 * List all Verticals
 */
const listAll = async (req, res) => {
  const verticals = await Vertical.find()
  res.json(verticals)
  logger.info({ method: 'listAll' }, 'List all Verticals', JSON.stringify(verticals))
}

/**
 * Update a vertical
 */
const updateData = async (req, res) => {
  const { department, subDepartment } = req.body

  let updatedBody = {
    ...req.body,
    departmentFormattedName: !isEmpty(department) ? department : "",
    subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""
  }
  const vertical = extend(req.vertical, updatedBody)
  const savedVertical = await vertical.save()
  res.json(savedVertical)
  logger.info({ method: 'updateData' }, 'Update a vertical', JSON.stringify(savedVertical))
}

/** Delete a vertical*/
const deleteData = async (req, res) => {
  const id = req.vertical._id
  logger.info({ method: 'deleteData' }, 'Delete a vertical', id)
  await Vertical.findByIdAndRemove(id)
  res.json(req.vertical)
}

const verticalById = async (req, res, next, id) => {
  const vertical = await Vertical.findById(id)

  if (!vertical) throw new NotFoundError

  req.vertical = vertical
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
  verticalById
}