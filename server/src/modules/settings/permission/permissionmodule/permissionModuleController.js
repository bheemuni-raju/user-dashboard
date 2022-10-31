const { extend } = require('lodash')
const { PermissionModule } = require('@byjus-orders/nexemplum/ums')

const { NotFoundError, BadRequestError } = require('../../../../lib/errors')
const commonController = require("../../../../common/dataController")
const bunyan = require('bunyan')

const logger = bunyan.createLogger({
    name: 'permissionModuleController',
    env: process.env.NODE_ENV,
    serializers: bunyan.stdSerializers,
    src: true
})

/*** Create a Permission Module*/
const createData = async (req, res) => {
    const { group = "", entities = "", app = "" } = req.body
    logger.info({ method: 'createData' }, "Create a permission module", group, entities, app)

    if (!group || !entities) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newModule = new PermissionModule({
        group: group.trim(),
        entities,
        app: app.trim()
    })

    const savedModule = await newModule.save()

    res.json(savedModule)
}

/*** Show the current Permission Module*/
const readData = (req, res) => {
    res.json(req.permissionModule)
}

/**
 * List all Modules
 */
const listAllData = async (req, res) => {
    const modules = await PermissionModule.find()

    res.json(modules)
}

/*** Update a Permission Module*/
const updateData = async (req, res) => {
    const permissionModule = extend(req.permissionModule, req.body)
    const savedModule = await permissionModule.save()

    res.json(savedModule)
}

/** Delete a Permission Module*/
const deleteData = async (req, res) => {
    const id = req.permissionModule._id

    await PermissionModule.findByIdAndRemove(id)

    res.json(req.permissionModule)
}

/**Get all Permission modules available */
const readPermissionModules = async (req, res) => {
    console.log(req.query.app)
    const modules = await PermissionModule.find()

    res.json(modules)
}

/**Permission Module middlewares */
const permissionModuleById = async (req, res, next, id) => {
    const permissionModule = await PermissionModule.findById(id)

    if (!permissionModule) throw new NotFoundError

    req.permissionModule = permissionModule
    next()
}


module.exports = {
    ...commonController,
    createData,
    readData,
    updateData,
    deleteData,
    listAllData,
    readPermissionModules,
    permissionModuleById
}
