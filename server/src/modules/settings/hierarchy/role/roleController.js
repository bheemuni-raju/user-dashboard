const Promise = require("bluebird");
const { extend, isNumber, get, isEmpty } = require('lodash')
const mongoose = require('mongoose')
const { Role, SubDepartment, Department, UeEmployee } = require('@byjus-orders/nexemplum/ums');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors');
const commonController = require("../../../../common/dataController");
const utils = require('../../../../lib/utils');
const { deleteUserFromCache } = require("../../../core/user/userCache")


/**
* Create a subDepartment role`
*/
const createData = async (req, res) => {
  const { name, level, department, subDepartment, type } = req.body

  if (!name || !department || !subDepartment || !isNumber(Number(level))) throw new BadRequestError("Invalid Request : Required parameters missing")

  const newRole = new Role({
    ...req.body,
    level: (type == "MISCELLANEOUS") ? null : level,
    formattedName: utils.formatName(name),
    departmentFormattedName: !isEmpty(department) ? department : "",
    subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""

  })

  const savedRole = await newRole.save()

  res.json(savedRole)
}

/**
 * Show the current role
 */
const readData = (req, res) => {
  res.json(req.role)
}

/**
 * List all teams
 */
const listAllTeamRoles = async (req, res) => {
  let { subDepartmentId: subDepartment, subDepartmentName } = req.query;

  let query = { subDepartment }
  if (subDepartmentName) {
    query = {
      subDepartmentFormattedName: subDepartmentName
    }
  }

  const roles = await Role.find(query).sort({ 'level': 1 }).lean();

  res.json(roles);
}

const clearCacheForRole = async (department, subDepartment, role) => {
  try {
    const appNameMap = {
      "user_experience": "uxachieve",
    };

    const appName = appNameMap[department];
    if (appName) {
      const roleData = await UeEmployee.find({ department, subDepartment, role }, { email: 1 });
      const emailsList = roleData.map(role => `${role.email}_${appName}`);
      await Promise.map(emailsList, async (key) => await deleteUserFromCache(key), { concurrency: 5 });
    }

  } catch (err) {
    console.log("Some error occured while clearing cache for role", err);
  }
}

/**
 * Update a role
 */
const updateData = async (req, res) => {
  const { department, subDepartment, departmentFormattedName, subDepartmentFormattedName, formattedName: roleFormattedName } = req.body;

  let updatedBody = {
    ...req.body,
    departmentFormattedName: !isEmpty(department) ? department : "",
    subDepartmentFormattedName: !isEmpty(subDepartment) ? subDepartment : ""
  }

  let role = extend(req.role, updatedBody) || {};
  role['formattedName'] = utils.formatName(role.name);
  const savedRole = await role.save()

  // Clear cache for all user in that particular role
  await clearCacheForRole(departmentFormattedName, subDepartmentFormattedName, roleFormattedName);

  res.json(savedRole)
}

/** Delete a role*/
const deleteData = async (req, res) => {
  const id = req.role._id

  await Role.findByIdAndRemove(id)

  res.json(req.role)
}

const roleById = async (req, res, next, id) => {
  const role = await Role.findById(id)

  if (!role) throw new NotFoundError

  req.role = role
  next()
}

module.exports = {
  ...commonController,
  createData,
  readData,
  listAllTeamRoles,
  updateData,
  deleteData,
  roleById
}
