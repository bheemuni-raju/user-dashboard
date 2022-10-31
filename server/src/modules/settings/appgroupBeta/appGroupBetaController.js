const { AppGroup, AppGroupUserMapping, Application, Organization, AppUser } = require('@byjus-orders/npgexemplum');
const { size, isEmpty, _ } = require('lodash');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');

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
      order: [['createdAt', 'DESC']],
      where: sqlFilter
    }

    const listSecret = await AppGroup.paginate(options);

    res.sendWithMetaData(listSecret);
  } catch (error) {
    throw error;
  }
};

const getUserListByAppGroupId = async (req, res) => {
  /**params request from a body */
  let { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
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
        model: AppUser,
        as: 'AppUser',
        attribute: ['id']
      }],
      order: [['createdAt', 'DESC']],
    };

    const vaultLogList = await AppGroupUserMapping.paginate(options);
    res.sendWithMetaData(vaultLogList);
  } catch (error) {
    throw error;
  }
};

const getAppDetailsByAppName = async (req, res) => {
  /**params request from a body */
  const { appName } = req.body;

  const options = {
    where: { name: appName }
  };
  try {
    const appDetails = await Application.findOne(options);
    return res.send(appDetails);
  } catch (error) {
    throw error;
  }
};

const createAppGroup = async (req, res) => {
  const { name, appId, createdBy, description, userId = [] } = req.body;

  try {

    const getOrgId = await Organization.findOne({ attributes: ['id'], where: { "orgName": 'byjus' } });
    if (isEmpty(getOrgId)) {
      return res.status(400).json({ message: "Organization not found" });
    }
    const todaysDate = new Date();
    const appGroupUserData = [];
    let appGroupUsers = {};
    const appGrpData = {
      name: name,
      formattedName: name,
      description: description,
      appId: appId,
      orgId: getOrgId.id,
      status: 'active',
      createdBy: createdBy,
      createdAt: todaysDate
    };

    const appGroup = await AppGroup.create(appGrpData);

    for (let index = 0; index < userId.length; index++) {
      appGroupUsers = {
        appGroupId: appGroup.id,
        userId: userId[index],
        createdBy: createdBy,
        createdAt: todaysDate,
        isActive: "active"
      };
      appGroupUserData.push(appGroupUsers);
    }
    const appGroupUserMapping = await AppGroupUserMapping.bulkCreate(appGroupUserData);

    return res.send(appGroupUserMapping);

  } catch (error) {
    throw error;
  }
};

const updateAppGroup = async (req, res) => {
  const { id, name, updatedBy, description } = req.body;

  try {
    const todaysDate = new Date();

    const updateAppGroup = await AppGroup.update({
      name: name,
      description,
      updatedBy,
      updatedAt: todaysDate
    }, { where: { id: id } });
    if (updateAppGroup) {
      return res.json(updateAppGroup);
    }
    return res.send('app group does not exist');

  } catch (error) {
    throw error;
  }
};

const updateAppGroupStatus = async (req, res) => {
  const { id, status, updatedBy } = req.body;

  try {
    const todaysDate = new Date();
    const updateAppGroup = await AppGroup.update({
      status: status,
      updatedBy,
      updatedAt: todaysDate
    }, { where: { id: id } });

    if (updateAppGroup) {
      return res.json(updateAppGroup);
    }
    return res.send('app group does not exist');

  } catch (error) {
    throw error;
  }
};

const AssignUser = async (req, res) => {
  const { userId = [], appGroupId, createdBy } = req.body;

  try {
    const todaysDate = new Date();
    const appGroupUserData = [];
    const existingUser = [];
    let appGroupUsers = {};

    const checkUserGroupMapping = await AppGroupUserMapping.findAll({ attributes: ['userId'], where: { appGroupId: appGroupId, userId: { [Op.in]: userId } } });
    checkUserGroupMapping && checkUserGroupMapping.map(data => {
      existingUser.push(data.userId);
    })
    const userIds = existingUser ? _.difference(userId, existingUser) : userId;

    for (let index = 0; index < userIds.length; index++) {
      appGroupUsers = {
        appGroupId: appGroupId,
        userId: userIds[index],
        createdBy: createdBy,
        createdAt: todaysDate,
        isActive: "active"
      };
      appGroupUserData.push(appGroupUsers);
    }

    const appGroupUserMapping = await AppGroupUserMapping.bulkCreate(appGroupUserData);

    return res.send(appGroupUserMapping);

  } catch (error) {
    throw error;
  }
};

const unAssignUser = async (req, res) => {
  const { id, updatedBy } = req.body;

  try {
    deleteMapping = await AppGroupUserMapping.destroy({
      where: { id: id }
    });

    return res.send("user has been deleted from app group");
  } catch (error) {
    throw error;
  }
};


module.exports = {
  listData,
  getUserListByAppGroupId,
  getAppDetailsByAppName,
  createAppGroup,
  updateAppGroup,
  updateAppGroupStatus,
  AssignUser,
  unAssignUser
}