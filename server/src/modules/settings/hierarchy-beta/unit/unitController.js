const { get, size, isEmpty } = require('lodash');
const { Unit, Department, SubDepartment } = require('@byjus-orders/npgexemplum');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors');
const bunyan = require('../../../../lib/bunyan-logger');
const logger = bunyan('unitController');
const { getOrgId } = require('../utils/hierarchyUtil');
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const commonController = require("../../../../common/dataController");
const utils = require('../../../../lib/utils');
const { aggregatePaginate } = require("../../../../common/sqlAggregateHelper");

const listData = async (req, res) => {
  const { page, limit, sort , searchCriterias = [], contextCriterias = [] } = req.body;

  let { filter = {} } = req.body;
  filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "Unit") : filter;
  const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);


  try {
    const options = {
      page: page || 1,
      paginate: limit || 10,
      sort,
      order: sqlOrder,
      where: filter.rootQuery,
    }

    const dataList = await Unit.paginate({
      ...options,
      where: filter.rootQuery,
      include: [
        ...filter.associationQuery,
        { model: Department, as: "departmentWithUnit", required: true },
        { model: SubDepartment, as: "subdepartmentWithUnit", required: true },
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
* Create a unit
*/
const createData = async (req, res) => {
  let orgName = get(req, "user.orgFormattedName", "");
  let orgId = await getOrgId(orgName);
  const { name, department, subDepartment } = req.body;
  logger.info({ method: 'createData' }, 'Create a Unit', JSON.stringify(req.body));

  try {
    if (!name || !department || !subDepartment) throw new Error('Parameters missing');

    const newUnit = new Unit({
      ...req.body,
      status: "active",
      orgId,
      formattedName: utils.formatName(name),
      departmentId: department,
      subdepartmentId: subDepartment,
      createdAt: new Date(),
      createdBy: req.user ? get(req.user, 'email') : 'system'
    })

    const savedUnit = await newUnit.save();
    res.json(savedUnit);
  }
  catch (err) {
    logger.error({ method: 'createData' }, 'Unit creation failed!', err);
    throw new Error(err);
  }
};

/**
 * Show the current unit
 */
const readData = (req, res) => {
  res.json(req.unit);
  logger.info({ method: 'readData' }, 'Show the current unit', JSON.stringify(req.unit));
};

/**
 * List all units
 */
const listAllData = async (req, res) => {
  const units = await Unit.find();
  res.json(units);
};

/**
 * Update a unit
 */
const updateData = async (req, res) => {
  const { id, department, subDepartment } = req.body;
  let subDeptData = await SubDepartment.findOne({ where: { id: subDepartment, departmentId: department } });

  if (isEmpty(subDeptData)) {
    logger.error({ method: 'Unit: updateData' }, 'Invalid Request : Required parameters missing');
    throw new BadRequestError('Invalid Request : Required parameters missing');
  } else {
    const savedUnit = await Unit.update({
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

    logger.info({ method: 'updateData' }, 'Update a unit', JSON.stringify(savedUnit));
    res.json(savedUnit);
  }
};

/** Delete a unit*/
const deleteData = async (req, res) => {
  const id = req.unit.id;
  logger.info({ method: 'deleteData' }, 'Delete a unit', id);

  await Unit.update({
    status: "inactive",
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system',
    deletedAt: new Date()
  }, {
    where: {
      id
    }
  });

  await Unit.destroy({ where: { id } });
  res.json(req.unit);
};

/**unit middlewares */
const unitById = async (req, res, next, id) => {
  const unit = await Unit.findOne({ where: { id } });
  if (!unit) throw new NotFoundError;
  req.unit = unit;
  next();
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