const { extend, get, size, isEmpty } = require('lodash')
const { Unit, Department, SubDepartment } = require('@byjus-orders/nexemplum/ums');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger')
const logger = bunyan('unitController')
const { criteriaBuilder } = require('../../../../common/criteriaBuilder');
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

    const list = await Unit.paginate(filter, options)
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}


/**
* Create a unit
*/
const createData = async (req, res) => {
  const { name, department, subDepartment } = req.body
  logger.info({ method: 'createData' }, 'Create a Unit', JSON.stringify(req.body))

  try {
    (!name || !department || !subDepartment)
  }
  catch (err) {
    logger.error({ method: 'createData' }, 'Invalid Request : Required parameters missing', err)
    throw new BadRequestError('Invalid Request : Required parameters missing')
  }

  const newUnit = new Unit({
    ...req.body,
    departmentFormattedName: !isEmpty(department) ? department : "",
    subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""
  })

  const savedUnit = await newUnit.save()
  res.json(savedUnit)
}

/**
 * Show the current unit
 */
const readData = (req, res) => {
  res.json(req.unit)
  logger.info({ method: 'readData' }, 'Show the current unit', JSON.stringify(req.unit))
}

/**
 * List all units
 */
const listAllData = async (req, res) => {
  const units = await Unit.find()
  res.json(units)
}

/**
 * Update a unit
 */
const updateData = async (req, res) => {
  const { department, subDepartment } = req.body

  let updatedBody = {
    ...req.body,
    departmentFormattedName: !isEmpty(department) ? department : "",
    subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""
  }
  const unit = extend(req.unit, updatedBody)
  const savedUnit = await unit.save()
  res.json(savedUnit)
  logger.info({ method: 'updateData' }, 'Update a unit', JSON.stringify(savedUnit))
}

/** Delete a unit*/
const deleteData = async (req, res) => {
  const id = req.unit._id
  logger.info({ method: 'deleteData' }, 'Delete a unit', id)
  await Unit.findByIdAndRemove(id)
  res.json(req.unit)
}

/**unit middlewares */
const unitById = async (req, res, next, id) => {
  const unit = await Unit.findById(id)

  if (!unit) throw new NotFoundError

  req.unit = unit
  next()
}

module.exports = {
  ...commonController,
  listData,
  createData,
  readData,
  listAllData,
  updateData,
  deleteData,
  unitById
}
