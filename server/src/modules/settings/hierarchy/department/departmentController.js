const { extend, size, get } = require('lodash')
const { Department, Employee, SubDepartment, Role } = require('@byjus-orders/nexemplum/ums');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger');

const { criteriaBuilder } = require('../../../../common/criteriaBuilder');

const logger = bunyan('departmentController');
const permissionList = require('../../../../lib/permissionList');
const { updateContextCriteriaBasedOnHierarchyPermissions } = require('../utils/hierarchyUtil');

const listData = async (req, res) => {
  const user = req.user;
  let userPermissions = req.user.permissions;
  let hierarchyBasedPermissions = get(permissionList, 'hierarchy', {});
  let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
  contextCriterias = updateContextCriteriaBasedOnHierarchyPermissions(userPermissions, hierarchyBasedPermissions, contextCriterias, "formattedName");
  filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select
    }

    const list = await Department.paginate(filter, options)
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

/**
* Create a Department
*/
const createData = async (req, res) => {
  const { name } = req.body
  if (!name) throw new Error("Name is required");
  logger.info({ method: 'createData' }, 'Create a Department', name)

  try {
    const newDepartment = new Department({
      ...req.body,
      formattedName: utils.formatName(name)
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
  let department = extend(req.department, req.body) || {};
  department['formattedName'] = utils.formatName(department.name);
  const savedDepartment = await department.save()

  res.json(savedDepartment)
  logger.info({ method: 'updateData' }, 'Update a department', JSON.stringify(savedDepartment))
}

/** Delete a department*/
const deleteData = async (req, res) => {
  const id = req.department._id
  logger.info({ method: 'deleteData' }, 'Delete a department', id)
  await Department.findByIdAndRemove(id)

  res.json(req.department)
}

/**
 * Create a department property
 */
const createProperty = async (req, res) => {
  let department = req.department;
  logger.info({ method: 'createProperty' }, 'Create a department property', department)
  try {
    department.properties.push({
      ...req.body,
      name: req.body.name,
      type: req.body.type,
      formattedName: req.body.name.toLowerCase().replace(/ /g, "_")
    })
    const savedDepartment = await department.save()
    res.json(savedDepartment)
  }
  catch (error) {
    res.status(500).json({ message: "Error occured.Please check!" })
    logger.error({ method: 'createProperty' }, 'Error Occured on Create Department', department)
  }
}

/**
 * Update a department property
 */
const updateProperty = async (req, res) => {
  const department = req.department
  logger.info({ method: 'updateProperty' }, 'Update a department property', department)
  //copy all the props from body to subdocument
  extend(req.property, req.body)
  const savedDepartment = await department.save()
  res.json(savedDepartment)
}
/**
 * Delete department property
 */
const deleteProperty = async (req, res) => {
  const department = req.department
  logger.info({ method: 'deleteProperty' }, 'Delete department property', department)
  const delDoc = department.properties.id(req.params.propertyId).remove()
  const savedDepartment = await department.save()

  res.json(savedDepartment)
}

/**To get employees grouped by role in a department */
const readDepartmentEmployees = async (req, res) => {
  const department = req.department
  const roles = department.roles

  const employees = roles.map(async (role) => {
    const employee = await Employee.find({ role: ["bda"] })
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
    formattedName: name
  }).lean();

  console.log(department._id);
  const subDepartments = await SubDepartment.find({
    departmentFormattedName: name
  }, '_id name formattedName department');
  const roles = await Role.find({
    departmentFormattedName: name
  });

  res.json({
    message: 'Success',
    subDepartments,
    roles
  });
}

/*Department middlewares */
const departmentById = async (req, res, next, id) => {
  const department = await Department.findById(id)

  if (!department) throw new NotFoundError

  req.department = department
  next()
}

const propertyById = async (req, res, next, id) => {
  if (!id) throw new NotFoundError("message: _id is missing")
  //Department not found
  if (!req.department && !req.department.properties) throw new NotFoundError
  const currentProperty = req.department.properties.id(id)
  //Property not found
  if (!currentProperty) throw new NotFoundError
  req.property = currentProperty

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
  createProperty,
  updateProperty,
  deleteProperty,
  readDepartmentEmployees,
  departmentById,
  propertyById,
  readByFormattedName
}
