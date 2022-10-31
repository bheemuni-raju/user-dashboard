const { extend, get, size, isEmpty } = require('lodash');
const { sqlCriteriaBuilder } = require("../../../../common/sqlCriteriaBuilder");
const { Vertical, Department, SubDepartment } = require('@byjus-orders/npgexemplum');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')
const bunyan = require('../../../../lib/bunyan-logger')

const logger = bunyan('VerticalController')

const listData = async (req, res) => {
  const { page, limit, sort , searchCriterias = [], contextCriterias = [] } = req.body;

  let { filter = {} } = req.body;
  filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "Vertical") : filter;
  const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);


  try {
    const options = {
      page: page || 1,
      paginate: limit || 10,
      sort,
      order: sqlOrder,
      where: filter.rootQuery,
    }

    const dataList = await Vertical.paginate({
      ...options,
      where: filter.rootQuery,
      include: [
        ...filter.associationQuery,
        { model: Department, as: "departmentWithVertical", required: true },
        { model: SubDepartment, as: "subdepartmentWithVertical", required: true },
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
 *  Create a Vertical 
 */
const createData = async (req, res) => {
  let orgName = get(req, "user.orgFormattedName", "");
  let orgId = await getOrgId(orgName);
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
    status: "active",
    orgId,
    formattedName: utils.formatName(name),
    departmentId: department,
    subdepartmentId: subDepartment,
    createdAt: new Date(),
    createdBy: req.user ? get(req.user, 'email') : 'system'
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
  const { id, department, subDepartment } = req.body
  let subDeptData = await SubDepartment.findOne({ where: { id: subDepartment, departmentId: department } })

  if (isEmpty(subDeptData)) {
    logger.error({ method: 'Vertical: updateData' }, 'Invalid Request : Required parameters missing')
    throw new BadRequestError('Invalid Request : Required parameters missing')
  }
  else {
    const savedVertical = await Vertical.update({
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

    logger.info({ method: 'updateData' }, 'Update a vertical', JSON.stringify(savedVertical))
    res.json(savedVertical)
  }
}

/** Delete a vertical*/
const deleteData = async (req, res) => {
  const id = req.vertical.id
  logger.info({ method: 'deleteData' }, 'Delete a vertical', id)
  await Vertical.update({
    status: "inactive",
    updatedAt: new Date(),
    updatedBy: req.user ? get(req.user, 'email') : 'system',
    deletedAt: new Date()
  }, {
    where: {
      id
    }
  })
  await Vertical.destroy({ where: { id } })
  res.json(req.vertical)
}

const verticalById = async (req, res, next, id) => {
  const vertical = await Vertical.findOne({ where: { id } })
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