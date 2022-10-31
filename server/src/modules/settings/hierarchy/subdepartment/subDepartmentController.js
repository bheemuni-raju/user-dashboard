const { extend, get, size, isEmpty } = require('lodash')
const {
  SubDepartment, Unit, Vertical, Campaign, Role, Department
} = require('@byjus-orders/nexemplum/ums');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils');
const bunyan = require('../../../../lib/bunyan-logger');
const { criteriaBuilder } = require('../../../../common/criteriaBuilder');

const logger = bunyan('subDepartmentController');
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

    const list = await SubDepartment.paginate(filter, options)
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

/**
* Create a SubDepartment
*/
const createData = async (req, res) => {
  const { name, department } = req.body
  logger.info({ method: 'createData' }, 'Create a SubDepartment', JSON.stringify(req.body))

  try {
    (!name || !department)
  }
  catch (err) {
    logger.error({ method: 'createData' }, 'Invalid Request : Required parameters missing', err)
    throw new BadRequestError('Invalid Request : Required parameters missing')
  }

  const newSubDepartment = new SubDepartment({
    ...req.body,
    formattedName: utils.formatName(name),
    departmentFormattedName: !isEmpty(department) ? department : "",
  })

  const savedSubDepartment = await newSubDepartment.save()

  res.json(savedSubDepartment)
}

/**
 * Show the current team
 */
const readData = (req, res) => {
  res.json(req.subDepartment)
  logger.info({ method: 'readData' }, 'Show the current team', JSON.stringify(req.subDepartment))
}

/**
 * List all subDepartments
 */
const listAllData = async (req, res) => {
  const subDepartments = await SubDepartment.find()

  res.json(subDepartments)
}

/**
 * Update a subDepartment
 */
const updateData = async (req, res) => {
  const { department } = req.body

  let updatedBody = {
    ...req.body,
    departmentFormattedName: !isEmpty(department) ? department : ""
  }

  let subDepartment = extend(req.subDepartment, updatedBody) || {};
  subDepartment['formattedName'] = utils.formatName(subDepartment.name);
  const savedSubDepartment = await subDepartment.save()

  res.json(savedSubDepartment)
  logger.info({ method: 'updateData' }, 'Update a subDepartment', JSON.stringify(savedSubDepartment))
}

/** Delete a subDepartment*/
const deleteData = async (req, res) => {
  const id = req.subDepartment._id
  logger.info({ method: 'deleteData' }, 'Delete a subDepartment', id)

  await SubDepartment.findByIdAndRemove(id)

  res.json(req.subDepartment)
}

const getTeamDetailsBySubDepartment = async (req, res) => {
  let { id, name = "", roleType } = req.body;
  name = name.toLowerCase().replace(/ /g, '_');

  logger.info({ method: "getTeamDetailsBySubDepartment", message: "Fetching Team Details by SubDepartment" }, name);

  try {
    const searchQuery = id ? { "_id": id } : { "formattedName": name }
    if (!id && !name) throw new Error("SubDepartment name is missing");
    const subDepartmentData = await SubDepartment.findOne(searchQuery).lean();

    if (!subDepartmentData) throw new Error(`SubDepartment with ${name} name is not found`);

    let departmentFormattedName = get(subDepartmentData, "departmentFormattedName", "");
    let subDepartmentFormattedName = get(subDepartmentData, "formattedName", "");

    const roleQuery = roleType ? { departmentFormattedName, subDepartmentFormattedName, type: roleType } : { subDepartmentFormattedName: subDepartmentData.formattedName };
    const availableRoles = await Role.find(roleQuery).lean();
    const availableUnits = await Unit.find({ departmentFormattedName, subDepartmentFormattedName }).lean();
    const availableVerticals = await Vertical.find({ departmentFormattedName, subDepartmentFormattedName }).lean();
    const availableCampaigns = await Campaign.find({ departmentFormattedName, subDepartmentFormattedName }).lean();

    const teamDetails = {
      ...subDepartmentData,
      units: availableUnits,
      verticals: availableVerticals,
      campaigns: availableCampaigns,
      roles: availableRoles
    };

    res.json(teamDetails);
  } catch (error) {
    logger.error({ method: 'createData' }, 'Error in fetching team details by subDepartment', error);
    throw new Error(`Error in fetching team details by subDepartment ${error}`);
  }
}

/**subDepartment middlewares */
const subDepartmentById = async (req, res, next, id) => {
  const subDepartment = await SubDepartment.findById(id)

  if (!subDepartment) throw new NotFoundError

  req.subDepartment = subDepartment
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
  getTeamDetailsBySubDepartment,
  subDepartmentById
}
