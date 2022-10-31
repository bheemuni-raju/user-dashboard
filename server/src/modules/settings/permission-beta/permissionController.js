const { size, isEmpty, get } = require('lodash')
const { sqlCriteriaBuilder } = require("../../../common/sqlCriteriaBuilder");
const { Permission, PermissionModule, PermissionEntity, Application, Organization } = require('@byjus-orders/npgexemplum');
const Promise = require('bluebird');
const Op = require('sequelize').Op;

const { getOrgId, getAppId } = require('../../settings/hierarchy-beta/utils/hierarchyUtil');
const commonController = require("../../../common/dataController");
const bunyan = require('bunyan');
const { ConnectionStates } = require('mongoose');

const logger = bunyan.createLogger({
  name: 'permissionController',
  env: process.env.NODE_ENV,
  serializers: bunyan.stdSerializers,
  src: true
})

const listData = async (req, res) => {
  const { page, limit, sort, searchCriterias = [], contextCriterias = [] } = req.body;

  let { filter = {} } = req.body;
  filter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, [], sort, false, "Permission") : filter;
  const sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);

  let subfilter = size(contextCriterias) !== 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias, sort, false, "") : {};

  let permissionGroup = "";
  let moduleId = "";
  if (!isEmpty(searchCriterias) && typeof (searchCriterias) === "object") {
    if (searchCriterias.searchBuilder[0].selectedColumn === "entityWithPermission.moduleWithEntity.permissionGroup") {
      permissionGroup = searchCriterias.searchBuilder[0].selectedValue[0];
    }
  }

  if (!isEmpty(permissionGroup)) {
    const appId = contextCriterias[0].selectedValue;
    const moduleDetails = await PermissionModule.findOne({ where: { permissionGroup, appId } });
    moduleId = get(moduleDetails, "id", "");
  }

  let subQuery = {
    'id': { [Op.ne]: null }
  }

  if (!isEmpty(moduleId)) {
    subQuery["module_id"] = moduleId;
  }

  try {
    const options = {
      page: page || 1,
      paginate: limit || 10,
      sort,
      order: sqlOrder,
      where: filter.rootQuery,
      include:
      {
        model: PermissionEntity,
        as: 'entityWithPermission',
        where: subQuery,
        include: [{
          model: PermissionModule,
          as: 'moduleWithEntity',
          where: subfilter.rootQuery,
          include: {
            model: Application,
            as: 'appWithModule'
          }
        }, {
          model: PermissionModule,
          as: 'moduleWithEntity',
          include: {
            model: Organization,
            as: 'orgWithModule'
          }
        }]
      }
    }

    const dataList = await Permission.paginate(options);

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

/*** Create a Permission Module, Permission Entity, Permission*/
const createData = async (req, res) => {
  try {
    const { group = "", entities = [], app = "" } = req.body
    const org = get(req, "user.orgFormattedName", "");
    logger.info({ method: 'createData' }, "Create a permission module", group, entities, app)

    if (!group || !entities) throw new BadRequestError("Invalid Request : Required parameters missing")

    const orgId = await getOrgId(org);
    const appId = await getAppId(app);
    let message = "UPSERT FAILURE";

    const isUpsertedPermissionModule = await upsertPermissionModule(group, appId, orgId, req.user);
    if (isUpsertedPermissionModule) {
      const moduleDetails = await PermissionModule.findOne({ where: { permissionGroup: group.trim(), appId, orgId } });
      const moduleId = get(moduleDetails, "id", "");

      const isUpsertedPermissionEntity = await upsertPermissionEntity(entities, moduleId, req.user);
      if (isUpsertedPermissionEntity) {
        message = "UPSERT SUCCESS";
      }
    }
    return res.json({ ...req.body, message });

  }
  catch (error) {
    throw new Error(error || "Error creating the permission");
  }

}

const upsertPermissionModule = async (group, appId, orgId, user) => {
  try {
    const permissionDetails = await PermissionModule.findOne({ where: { permissionGroup: group, appId, orgId } });
    if (isEmpty(permissionDetails)) {
      await PermissionModule.create({
        permissionGroup: group,
        appId,
        orgId,
        createdAt: new Date(),
        createdBy: user ? get(user, 'email') : 'system',
        updatedAt: new Date(),
        updatedBy: user ? get(user, 'email') : 'system'
      });
    }

    return true;
  }
  catch (error) {
    console.log(error);
  }

  return false;
}

const upsertPermissionEntity = async (entities, moduleId, user) => {
  let isUpsertedPermissionEntity = false;
  try {
    await Promise.map(entities, async entityObject => {
      const entityDetails = await PermissionEntity.findOne({ where: { entityName: entityObject.entityName, moduleId } });
      if (isEmpty(entityDetails)) {
        await PermissionEntity.create({
          entityName: entityObject.entityName,
          moduleId,
          createdAt: new Date(),
          createdBy: user ? get(user, 'email') : 'system',
          updatedAt: new Date(),
          updatedBy: user ? get(user, 'email') : 'system'
        });
      }

      const newEntityDetails = await PermissionEntity.findOne({ where: { entityName: entityObject.entityName, moduleId } });
      const entityId = get(newEntityDetails, "id", "");

      if (!isEmpty(entityId)) {
        const isUpsertedPermission = await upsertPermission(entityObject.permissionObject, entityId, user);
        isUpsertedPermissionEntity = isUpsertedPermission;
      }
    });

    return isUpsertedPermissionEntity;
  }
  catch (error) {
    console.log(error);
  }

  return isUpsertedPermissionEntity;
}

const upsertPermission = async (permissions, entityId, user) => {
  try {
    await Promise.map(Object.keys(permissions), async pKey => {
      const permissionDetails = await Permission.findOne({ where: { permissionKey: pKey, permissionValue: permissions[pKey], entityId } });
      if (isEmpty(permissionDetails)) {
        await Permission.create({
          permissionKey: pKey,
          permissionValue: permissions[pKey],
          entityId,
          createdAt: new Date(),
          createdBy: user ? get(user, 'email') : 'system',
          updatedAt: new Date(),
          updatedBy: user ? get(user, 'email') : 'system'
        });
      }
    });

    return true;
  }
  catch (error) {
    console.log(error);
  }

  return false;
}

/*** Show the current Permission Module*/
const readData = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const permissionDetails = await Permission.findOne({ where: { id: permissionId } });
    const entityDetails = await PermissionEntity.findOne({ where: { id: permissionDetails.entityId } });
    const moduleDetails = await PermissionModule.findOne({ where: { id: entityDetails.moduleId } });
    const orgDetails = await Organization.findOne({ where: { id: moduleDetails.org_id } });
    const appDetails = await Application.findOne({ where: { id: moduleDetails.app_id } });

    const formattedObject = {
      ...permissionDetails,
      entityWithPermission: {
        ...entityDetails
      },
      moduleWithEntity: {
        ...moduleDetails
      },
      orgWithModule: {
        ...orgDetails
      },
      appWithModule: {
        ...appDetails
      }
    }

    res.json(formattedObject);

  }
  catch (error) {
    throw new Error(error || "Error fecthing permission details");
  }
}

// /*** Update a Permission Module*/
const updateData = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { entities } = req.body;

    await Promise.map(entities, async (entityObject) => {
      let { permissionObject } = entityObject;
      await Promise.map(Object.keys(permissionObject), async (pkey) => {
        await Permission.update({
          permissionKey: pkey,
          permissionValue: permissionObject[pkey],
          updatedBy: req.user ? req.user.email : "system",
          updatedAt: new Date()
        }, { where: { id: permissionId } });
      })

      return res.json({ message: "Updated successfully" });
    })
  }
  catch (error) {
    throw new Error(error || "Error updating permission");
  }
}

/** Delete a Permission */
const deleteData = async (req, res) => {
  const { permissionId } = req.params;

  try {
    await Permission.destroy({
      where: { id: permissionId }
    });

    res.json({ message: "Delete Successful" });
  }
  catch (error) {
    throw new Error(error || "Error deleting the permission");
  }
}

const listAllApplications = async (req, res) => {
  try {
    const apps = await Application.findAll();
    res.json(apps);
  }
  catch (error) {
    throw new Error(error || "Error fetching all applications");
  }
}


module.exports = {
  ...commonController,
  listData,
  createData,
  readData,
  updateData,
  deleteData,
  listAllApplications
}
