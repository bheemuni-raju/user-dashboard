const { extend, size, get } = require('lodash')

const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const { Organization, Department, Employee, SubDepartment, Role } = require("@byjus-orders/npgexemplum");

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger');

const logger = bunyan('departmentController');
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
        as: 'organizationWithDepartment',
        attribute: ['org_id']
      }]
    }

    const list = await Department.paginate(options)
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
* Create a Department
*/
const createData = async (req, res) => {
  let orgName = get(req, "user.orgFormattedName", "");
  let orgId = await getOrgId(orgName);
  const { name } = req.body
  if (!name) throw new Error("Name is required");
  logger.info({ method: 'createData' }, 'Create a Department', name)

  try {
    const newDepartment = new Department({
      ...req.body,
      orgId,
      formattedName: utils.formatName(name),
      status: "active",
      createdAt: new Date(),
      createdBy: req.user ? get(req.user, 'email') : 'system'
    })

    const savedDepartment = await newDepartment.save()

    res.json(savedDepartment)
  }
  catch (err) {
    logger.error({ method: 'createData' }, 'Invalid Request : Required parameters missing', err)
    throw new BadRequestError('Invalid Request : Required parameters missing')
  }
}

/**
 * Show the current department
 */
const readData = (req, res) => {
  res.json(req.department)
  logger.info({ method: 'readData' }, 'Show the current department', JSON.stringify(req.department))
}

/**
 * List all departments
 */
const listAllData = async (req, res) => {
  const departments = await Department.find()

  res.json(departments)
}

/**
 * Update a department
 */
const updateData = async (req, res) => {
  const id = req.body.id
  const savedDepartment = await Department.update({
    ...req.body,
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system'
  }, {
    where: {
      id
    }
  })

  res.json(savedDepartment)
  logger.info({ method: 'updateData' }, 'Update a department', JSON.stringify(savedDepartment))
}

/** Delete a department*/
const deleteData = async (req, res) => {
  const id = req.body.id
  logger.info({ method: 'deleteData' }, 'Delete a department', id)
  await Department.update({
    status: "inactive",
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system',
    deletedAt: new Date()
  }, {
    where: {
      id
    }
  })
  await Department.destroy({ where: { id } })

  res.json(req.body)
}

/**To get employees grouped by role in a department */
const readDepartmentEmployees = async (req, res) => {
  const department = req.body
  const roles = department.roles

  const employees = roles.map(async (role) => {
    const employee = await Employee.find({ where: { role: ["bda"] } })
    return {
      role: employee
    }
  })

  console.log(employees)
  res.json(employees)
}

const readByFormattedName = async (req, res) => {
  const { name } = req.body;
  console.log(name);
  if (!name) throw new Error("Department formattedName is required");

  const department = await Department.findOne({
    where: {
      formattedName: name
    }
  }).lean();

  console.log(department.id);
  const subDepartments = await SubDepartment.find({
    where: {
      departmentId: get(department, "id")
    }
  }, 'id name formattedName department');
  const roles = await Role.find({
    where: {
      departmentId: get(department, "id")
    }
  });

  res.json({
    message: 'Success',
    subDepartments,
    roles
  });
}

/*Department middlewares */
const departmentById = async (req, res, next, id) => {
  const department = await Department.findOne({ where: { id } })
  if (!department) throw new NotFoundError
  req.department = department
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
  readDepartmentEmployees,
  departmentById,
  readByFormattedName
}
