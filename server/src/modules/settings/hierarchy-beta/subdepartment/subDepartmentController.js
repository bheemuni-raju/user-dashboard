const { extend, get, size, isEmpty } = require('lodash')
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const { Organization, Department, SubDepartment, Unit, Vertical, Campaign, Role } = require("@byjus-orders/npgexemplum");

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils');
const bunyan = require('../../../../lib/bunyan-logger');

const logger = bunyan('subDepartmentController');
const permissionList = require('../../../../lib/permissionList');
const { updateContextCriteriaBasedOnHierarchyPermissions, getOrgId } = require('../utils/hierarchyUtil');

const listData = async (req, res) => {
  const { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
  const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;

  const sqlOrder = Object.keys(sort).map(item => {
    return [item, sort[item]];
  });

  try {
    const options = {
      page: page || 1,
      paginate: limit || 10,
      order: sqlOrder,
      where: sqlFilter,
      include: [{
        model: Organization,
        as: 'organizationWithSubDepartment',
        attribute: ['org_id']
      }, {
        model: Department,
        as: 'departmentWithSubDepartment',
        attribute: ['department_id']
      }]
    }

    const list = await SubDepartment.paginate(options);
    res.sendWithMetaData({
      ...list,
      page,
      limit
    });
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

/**
* Create a SubDepartment
*/
const createData = async (req, res) => {
  let orgName = get(req, "user.orgFormattedName", "");
  let orgId = await getOrgId(orgName);
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
    status: "active",
    orgId,
    formattedName: utils.formatName(name),
    departmentId: department,
    createdAt: new Date(),
    createdBy: req.user ? get(req.user, 'email') : 'system'
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
  const id = req.body.id

  const { department } = req.body

  const savedSubDepartment = await SubDepartment.update({
    ...req.body,
    departmentId: department,
    department_id: department,
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system'
  }, {
    where: {
      id
    }
  });

  res.json(savedSubDepartment)
  logger.info({ method: 'updateData' }, 'Update a subDepartment', JSON.stringify(savedSubDepartment))
}

/** Delete a subDepartment*/
const deleteData = async (req, res) => {
  const id = req.subDepartment.id
  logger.info({ method: 'deleteData' }, 'Delete a subDepartment', id)
  await SubDepartment.update({
    status: "inactive",
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system',
    deletedAt: new Date()
  }, {
    where: {
      id
    }
  })
  await SubDepartment.destroy({ where: { id } })

  res.json(req.subDepartment)
}

const getTeamDetailsBySubDepartment = async (req, res) => {
  let { id, formattedName = "", roleType } = req.body;

  logger.info({ method: "getTeamDetailsBySubDepartment", message: "Fetching Team Details by SubDepartment" }, formattedName);

  try {
    const searchQuery = id ? { "id": id } : { "formattedName": formattedName }
    if (!id && !formattedName) throw new Error("SubDepartment name is missing");
    const subDepartmentData = await SubDepartment.findOne({ where: searchQuery });

    if (!subDepartmentData) throw new Error(`SubDepartment with ${formattedName} name is not found`);

    let departmentId = get(subDepartmentData, "departmentId", "");
    let subDepartmentId = get(subDepartmentData, "id", "");

    const roleQuery = roleType ? { departmentId, subDepartmentId, roleType } : { subDepartmentId };
    const availableRoles = await Role.find({ where: roleQuery });
    const availableUnits = await Unit.find({ where: { departmentId, subDepartmentId } });
    const availableVerticals = await Vertical.find({ where: { departmentId, subDepartmentId } });
    const availableCampaigns = await Campaign.find({ where: { departmentId, subDepartmentId } });

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
  const subDepartment = await SubDepartment.findOne({ where: { id } })
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
