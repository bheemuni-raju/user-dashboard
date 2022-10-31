const Promise = require('bluebird');
const { extend, uniq, concat, isEmpty, get } = require('lodash');
const { PermissionTemplate, PermissionModule, Employee, MasterEmployee } = require('@byjus-orders/nexemplum/ums');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');

const { NotFoundError, BadRequestError } = require('../../../../lib/errors');
const Utils = require('../../../../lib/utils');
const commonController = require("../../../../common/dataController");
const logger = require('../../../../lib/bunyan-logger')('permissionTemplateController');

/*** Create a Permission Template*/
const createData = async (req, res) => {
    const { name, description, permissions, app } = req.body
    logger.info({ method: 'createData' }, "Create a permission template", name, description, permissions)

    if (!name || !app || !permissions) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newTemplate = new PermissionTemplate({
        name,
        formatted_name: Utils.formatName(name),
        description,
        permissions,
        app
    })

    try {
        const savedTemplate = await newTemplate.save()

        res.json(savedTemplate)
    } catch (error) {
        if (error && error.code === 11000) {
            logger.error({ method: 'createData' }, "Duplicate EmailId", error)
            throw new Error("Permission Template already exist!")
        }
        logger.error({ method: 'createData' }, "Permission Template creation failed", error)
        throw new Error(error)
    }
}

/*** Show the current Permission Template*/
const readData = (req, res) => {
    res.json(req.permissionTemplate)
}

/**
 * List all templates
 */
const listAllData = async (req, res) => {
    const templates = await PermissionTemplate.find()

    res.json(templates)
}

/*** Update a Permission Template*/
const updateData = async (req, res) => {
    let permissionTemplate = extend(req.permissionTemplate, req.body) || {};
    permissionTemplate['formatted_name'] = Utils.formatName(permissionTemplate.name);
    const savedTemplate = await permissionTemplate.save()

    res.json(savedTemplate)
}

/** Delete a Permission Template*/
const deleteData = async (req, res) => {
    const id = req.permissionTemplate._id

    await PermissionTemplate.findByIdAndRemove(id)

    res.json(req.permissionTemplate)
}

/**Get all Permission modules available */
const readPermissionModules = async (req, res) => {
    const { app } = req.query
    try {
        const modules = await PermissionModule.find({ app })
        res.json(modules)
    } catch (error) {
        throw new Error(error)
    }
}

/**Assign Permission Template to a set of Employees */
const assignPermissionTemplate = async (req, res) => {
    const { emails = [], templateFormattedName, templateName } = req.body;

    if (!emails || !templateFormattedName) throw new BadRequestError('templateFormattedName or Emails array is missing');

    if (emails.length) {
        await updatePermissionTemplate(emails, templateFormattedName, "assign");
    }

    res.json("Assigned Permission Template");
}

/**UnAssign Permission Template from a set of Employees */
const unassignPermissionTemplate = async (req, res) => {
    logger.info({ method: "unassignPermissionTemplate", message: `UnAssigning Permission Template` });
    const { emails = [], templateFormattedName, templateName } = req.body;

    if (!emails || !templateFormattedName) throw new BadRequestError('templateFormattedName or Emails array is missing');

    if (emails.length) {
        await updatePermissionTemplate(emails, templateFormattedName, "unassign");
    }

    res.json("Assigned Permission Template");
}

const updatePermissionTemplate = async (emails, templateFormattedName, type) => {
    const uniqEmailIdArray = uniq(emails);
    try {
        await Promise.map(uniqEmailIdArray, async (email) => {
            email = email.trim().toLowerCase();
            const employee = await MasterEmployee.findOne({ "email": email });
            if (employee) {
                const { department } = employee;
                const EmployeeCollection = userUtil.getEmployeeCollection(department[0]);

                let updateQuery = {};

                /**Add Permission Template */
                if (type === "assign") {
                    updateQuery = {
                        "$addToSet": {
                            "permissionTemplate": templateFormattedName
                        }
                    }
                    //permissionArray.push(templateFormattedName);
                }

                /**Remove Permission Template */
                if (type === "unassign") {
                    updateQuery = {
                        "$pull": {
                            "permissionTemplate": templateFormattedName
                        }
                    }
                }

                await EmployeeCollection.findOneAndUpdate({ "email": email }, updateQuery);

                let employeeDetails = await EmployeeCollection.findOne({ "email": email });
                let masterDetails = await MasterEmployee.findOne({ "email": email });
                if (!isEmpty(employeeDetails) && !isEmpty(masterDetails)) {
                    let masterPermissionTemplate = get(masterDetails, "permissionTemplate");
                    let employeePermissionTemplate = get(employeeDetails, "permissionTemplate");
                    if (isEmpty(masterPermissionTemplate) && !isEmpty(employeePermissionTemplate)) {
                        await MasterEmployee.findOneAndUpdate({ "email": email }, {
                            "$set": {
                                "permissionTemplate": employeePermissionTemplate
                            }
                        });
                    }
                    else if (!isEmpty(masterPermissionTemplate) && !isEmpty(employeePermissionTemplate)) {
                        let permissionTemplate = uniq(concat(masterPermissionTemplate, employeePermissionTemplate));
                        await MasterEmployee.findOneAndUpdate({ "email": email }, {
                            "$set": {
                                "permissionTemplate": permissionTemplate
                            }
                        });
                    }
                }

                await MasterEmployee.updateOne({ "email": email }, updateQuery);
            }
            return;
        }, {
            concurrency: 10
        });

        return;
    } catch (error) {
        throw new Error(error);
    }
}

/**Permission Template middlewares */
const permissionTemplateById = async (req, res, next, id) => {
    const permissionTemplate = await PermissionTemplate.findById(id)

    if (!permissionTemplate) throw new NotFoundError

    req.permissionTemplate = permissionTemplate
    next()
}

/**Permission Template middlewares */
const permissionTemplateByName = async (req, res, next, templateName) => {
    const permissionTemplate = await PermissionTemplate.find({ name: templateName })

    if (!permissionTemplate) throw new NotFoundError

    req.permissionTemplate = permissionTemplate
    next()
}

module.exports = {
    ...commonController,
    createData,
    readData,
    updateData,
    deleteData,
    listAllData,
    assignPermissionTemplate,
    unassignPermissionTemplate,
    readPermissionModules,
    permissionTemplateById
}
