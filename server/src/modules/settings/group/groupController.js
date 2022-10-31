const { extend, isNumber, isEmpty, get, uniq, concat } = require('lodash')
const Promise = require('bluebird')

const { NotFoundError, BadRequestError } = require('../../../lib/errors');
const { Employee, PermissionTemplate, MasterEmployee } = require('@byjus-orders/nexemplum/ums');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');
const { Group } = require('@byjus-orders/nexemplum/ums');
const commonController = require("../../../common/dataController");
const utils = require('../../../lib/utils');

/**
* Create a group
*/
const createData = async (req, res) => {
  const { name, description } = req.body

  try {
    if (!name || !description) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newGroup = new Group({
      ...req.body,
      formattedName: utils.formatName(name)
    });

    const savedGroup = await newGroup.save();
    res.json(savedGroup);
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Show the current group
 */
const readData = (req, res) => {
  res.json(req.group)
}

/**
 * Update a group
 */
const updateData = async (req, res) => {
  try {
    const { owner, ownerPermissionTemplate } = req.body;
    const { formattedName } = req.group;
    const savedGroup = await Group.findOneAndUpdate({ formattedName }, {
      $set: {
        ...req.body
      }
    });
    await assignGroupDetailsToOwner(owner, ownerPermissionTemplate, formattedName);

    res.json(savedGroup)
  } catch (error) {
    throw new Error(error);
  }
}

const addGroupManager = async (req, res) => {
  try {
    const { groupFormattedName, filterValue, users, updatedBy } = req.body;

    if (!groupFormattedName) throw new Error('groupFormattedName is required');

    await Group.findOneAndUpdate({ formattedName: groupFormattedName }, {
      "$push": {
        managers: {
          filterValue,
          users
        }
      },
      "$set": {
        updatedBy
      }
    });

    await addUsersToGroup(users, groupFormattedName);

    res.json({ message: "Managers updated successfully" });
  } catch (error) {
    throw new Error(error);
  }
}

const updateGroupManager = async (req, res) => {
  try {
    const { groupFormattedName, filterValue, users, updatedBy } = req.body;
    if (!groupFormattedName) throw new Error('groupFormattedName is required');

    const result = await Group.updateOne({ 'formattedName': groupFormattedName, 'managers.filterValue': filterValue }, {
      "$set": {
        "managers.$.users": users,
        updatedBy
      }
    });

    await addUsersToGroup(users, groupFormattedName);

    res.json({ message: "Managers updated successfully" });
  } catch (error) {
    throw new Error(error);
  }
}

const deleteGroupManager = async (req, res) => {
  try {
    const { groupFormattedName, filterValue, users, updatedBy } = req.body;
    if (!groupFormattedName) throw new Error('groupFormattedName is required');

    await Group.updateOne({ 'formattedName': groupFormattedName, 'managers.filterValue': filterValue }, {
      "$pull": {
        "managers": { filterValue }
      },
      "$set": {
        updatedBy
      }
    });

    await removeUsersFromGroup(users, groupFormattedName);

    res.json({ message: "Managers updated successfully" });
  } catch (error) {
    throw new Error(error);
  }
}

/** Delete a group*/
const deleteData = async (req, res) => {
  const formattedName = req.group.formattedName

  await Group.findOneAndRemove({ formattedName });

  res.json(req.group);
}

/** Assign users to a group*/
const assignUser = async (req, res) => {
  const { users = [], groupFormattedName } = req.body;

  if (!groupFormattedName) throw new Error(`groupFormattedName is missing`);
  if (isEmpty(users)) throw new Error(`users is missing`);

  try {
    //Assigning users in group
    await addUsersToGroup(users, groupFormattedName);

    res.json({
      message: 'Assigned successfully',
      users
    });
  } catch (error) {
    throw new Error(error);
  }
}

const addUsersToGroup = async (users, groupFormattedName) => {
  //Assigning users in group
  await Group.updateOne({ formattedName: groupFormattedName }, {
    "$addToSet": {
      "users": { "$each": users }
    }
  });

  const groupData = await Group.findOne({ formattedName: groupFormattedName });

  //Assigning groupFormattedName to user
  await Promise.map(users, async (user) => {
    const employee = await MasterEmployee.findOne({ "email": user.toLowerCase() });
    if (employee) {
      const { department } = employee;
      const EmployeeCollection = userUtil.getEmployeeCollection(department[0]);

      await EmployeeCollection.updateOne({ email: user.toLowerCase() }, {
        "$addToSet": {
          "groups": groupData.formattedName
        }
      });

      //Setting user groups and permissions in master employee collection
      await setUserGroupsPermissions(user, department[0]);
    }
  });
}

const assignGroupDetailsToOwner = async (user, permissionTemplate, groupFormattedName) => {
  const users = user;
  try {
    //Assigning users in group
    await Group.updateOne({ formattedName: groupFormattedName }, {
      "$addToSet": {
        "users": { "$each": users }
      }
    });

    //Assigning groupFormattedName to user
    await Promise.map(users, async (user) => {
      if (!isEmpty(user)) {
        const employee = await MasterEmployee.findOne({ "email": user.toLowerCase() });
        if (employee) {
          const { department } = employee;
          const EmployeeCollection = userUtil.getEmployeeCollection(department[0]);

          let updateQuery = {
            "$addToSet": {
              "groups": groupFormattedName,
              "permissionTemplate": { "$each": permissionTemplate }
            }
          }

          await setUserGroupsPermissions(user, department[0]);
          await EmployeeCollection.updateOne({ "email": user.toLowerCase() }, updateQuery);
          await MasterEmployee.updateOne({ "email": user.toLowerCase() }, updateQuery);
        }
      }
    });

    return;
  } catch (error) {
    throw new Error(error);
  }
}

/* Setting user groups and permissions in master employees collection */
const setUserGroupsPermissions = async (user, department) => {
  const EmployeeCollection = userUtil.getEmployeeCollection(department);
  let employeeDetails = await EmployeeCollection.findOne({ "email": user.toLowerCase() });
  let masterDetails = await MasterEmployee.findOne({ "email": user.toLowerCase() });
  if (!isEmpty(employeeDetails) && !isEmpty(masterDetails)) {
    let masterGroups = get(masterDetails, "groups", []);
    let employeeGroups = get(employeeDetails, "groups", []);

    let masterPermissionTemplate = get(masterDetails, "permissionTemplate", []);
    let employeePermissionTemplate = get(employeeDetails, "permissionTemplate", []);

    let updateCondition = {};
    let groups = uniq(concat(masterGroups, employeeGroups));
    let permissionTemplates = uniq(concat(masterPermissionTemplate, employeePermissionTemplate));

    if (!isEmpty(groups)) {
      updateCondition["groups"] = groups;
    }

    if (!isEmpty(permissionTemplates)) {
      updateCondition["permissionTemplate"] = permissionTemplates;
    }

    await MasterEmployee.findOneAndUpdate({ "email": user.toLowerCase() }, {
      "$set": updateCondition
    });
  }
}

/** Unassign users from a group*/
const unassignUser = async (req, res) => {
  const { users = [], groupFormattedName } = req.body;

  if (!groupFormattedName) throw new Error(`groupFormattedName is missing`);
  if (isEmpty(users)) throw new Error(`users is missing`);

  try {
    //UnAssigning users in group
    await removeUsersFromGroup(users, groupFormattedName);

    res.json({
      message: 'UnAssigned successfully',
      users
    });
  } catch (error) {
    throw new Error(error);
  }
}

const removeUsersFromGroup = async (users, groupFormattedName) => {
  await Group.updateOne({ formattedName: groupFormattedName }, {
    "$pullAll": {
      "users": users
    }
  });

  const groupData = await Group.findOne({ formattedName: groupFormattedName });
  //Assigning groupFormattedName to user
  await Promise.map(users, async (user) => {
    if (!isEmpty(user)) {
      const employee = await MasterEmployee.findOne({ "email": user.toLowerCase() });
      if (employee) {
        const { department } = employee;
        const EmployeeCollection = userUtil.getEmployeeCollection(department[0]);

        await EmployeeCollection.updateOne({ email: user.toLowerCase() }, {
          "$pull": {
            "groups": groupData && groupData.formattedName
          }
        });

        await MasterEmployee.updateOne({ email: user.toLowerCase() }, {
          "$pull": {
            "groups": groupData && groupData.formattedName
          }
        });
      }
    }
  });
}

/** Assign permissionTemplate to a group*/
const assignPermissionTemplate = async (req, res) => {
  const { permissionTemplate = [], groupFormattedName } = req.body;

  if (!groupFormattedName) throw new Error(`groupFormattedName is missing`);
  if (isEmpty(permissionTemplate)) throw new Error(`permissionTemplate is missing`);

  try {
    //Assigning users in group
    await Group.updateOne({ formattedName: groupFormattedName }, {
      "$addToSet": {
        "permissionTemplate": { "$each": permissionTemplate }
      }
    });

    res.json({
      message: 'Assigned successfully',
      permissionTemplate
    });
  } catch (error) {
    throw new Error(error);
  }
}

/** Unassign permissionTemplate from a group*/
const unassignPermissionTemplate = async (req, res) => {
  const { permissionTemplate = [], groupFormattedName } = req.body;

  if (!groupFormattedName) throw new Error(`groupFormattedName is missing`);
  if (isEmpty(permissionTemplate)) throw new Error(`permissionTemplate is missing`);

  try {
    //Assigning users in group
    await Group.updateOne({ formattedName: groupFormattedName }, {
      "$pullAll": {
        "permissionTemplate": permissionTemplate
      }
    });

    res.json({
      message: 'UnAssigned successfully',
      permissionTemplate
    });
  } catch (error) {
    throw new Error(error);
  }
}

const groupByFormattedName = async (req, res, next, formattedName) => {
  const group = await Group.findOne({ formattedName: formattedName });

  if (!group) throw new NotFoundError;

  req.group = group;
  next()
}

module.exports = {
  ...commonController,
  createData,
  readData,
  updateData,
  deleteData,
  assignUser,
  unassignUser,
  assignPermissionTemplate,
  unassignPermissionTemplate,
  addGroupManager,
  updateGroupManager,
  deleteGroupManager,
  groupByFormattedName
}
