const { extend, isNumber, get, isEmpty, size } = require('lodash')
const mongoose = require('mongoose')
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const { Role, SubDepartment, Department } = require('@byjus-orders/npgexemplum');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors');
const commonController = require("../../../../common/dataController");
const permissionList = require('../../../../lib/permissionList');
const utils = require('../../../../lib/utils');
const { updateContextCriteriaBasedOnHierarchyPermissions, getOrgId } = require('../utils/hierarchyUtil');

const listData = async (req, res) => {
  const { page, limit, sort , searchCriterias = [], contextCriterias = [] } = req.body;

  let { filter = {} } = req.body;
  filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "Role") : filter;
  const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);


  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      order: sqlOrder,
      where: filter.rootQuery,
    }

    const dataList = await Role.paginate({
      ...options,
      where: filter.rootQuery,
      include: [
        ...filter.associationQuery,
        { model: Department, as: "departmentWithRole", required: true },
        { model: SubDepartment, as: "subdepartmentWithRole", required: true },
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
* Create a subDepartment role`
*/
const createData = async (req, res) => {
  let orgName = get(req, "user.orgFormattedName", "");
  let orgId = await getOrgId(orgName);
  const { name, level, department, subDepartment, type } = req.body

  if (!name || !department || !subDepartment || !isNumber(Number(level))) throw new BadRequestError("Invalid Request : Required parameters missing")

  const newRole = new Role({
    ...req.body,
    level: (type == "MISCELLANEOUS") ? null : level,
    status: "active",
    orgId,
    formattedName: utils.formatName(name),
    departmentId: department,
    subdepartmentId: subDepartment,
    createdAt: new Date(),
    createdBy: req.user ? get(req.user, 'email') : 'system'
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

  let query = { subDepartmentId: subDepartment }
  if (subDepartmentName) {
    const subdeptData = await SubDepartment.findOne({ where: { formattedName: snakeCase(subDepartmentName) } });

    query = {
      subDepartmentId: !isEmpty(subdeptData) ? get(subdeptData, "id", "") : ""
    }
  }

  const roles = await Role.find({ where: query }).sort({ 'level': 1 }).lean();
  res.json(roles);
}

/**
 * Update a role
 */
const updateData = async (req, res) => {
  const { id, department, subDepartment, name } = req.body;
  let subDeptData = await SubDepartment.findOne({ where: { id: subDepartment, departmentId: department } })

  if (isEmpty(subDeptData)) {
    logger.error({ method: 'Vertical: updateData' }, 'Invalid Request : Required parameters missing')
    throw new BadRequestError('Invalid Request : Required parameters missing')
  }
  else {
    const savedRole = await Role.update({
      ...req.body,
      departmentId: department,
      department_id: department,
      subdepartmentId: subDepartment,
      subdepartment_id: subDepartment,
      formattedName: utils.formatName(name),
      updatedAt: new Date(),
      updatedBy: req.user ? get(req.user, 'email') : 'system'
    }, {
      where: {
        id
      }
    });

    res.json(savedRole)
  }
}

/** Delete a role*/
const deleteData = async (req, res) => {
  const id = req.role.id
  await Role.update({
    status: "inactive",
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system'
  }, {
    where: {
      id
    }
  })
  await Role.destroy({ where: { id } });
  res.json(req.role)
}

const roleById = async (req, res, next, id) => {
  const role = await Role.findOne({ where: { id } });
  if (!role) throw new NotFoundError
  req.role = role
  next()
}

module.exports = {
  ...commonController,
  listData,
  createData,
  readData,
  listAllTeamRoles,
  updateData,
  deleteData,
  roleById
}
