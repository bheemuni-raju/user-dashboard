const Router = require('express-promise-router')
const controller = require('./permissionTemplateController')

const defaultRoutes = (routeName, controller) => {
  const router = Router({ mergeParams: true })

  router.route(`/${routeName}/list`)
    .post(controller.listData)
  router.route(`/${routeName}/colUniqueValues`)
    .get(controller.getColUniqueValues)
  router.route(`/${routeName}/download`)
    .post(controller.downloadData)

  return router
}

module.exports = () => {
  const router = defaultRoutes('permissionTemplate', controller)

  router.route('/permissionTemplate')
    .post(controller.createData)

  router.route('/permissionTemplate/assign')
    .post(controller.assignPermissionTemplate)

  router.route('/permissionTemplate/unassign')
    .post(controller.unassignPermissionTemplate)

  router.route('/permissionTemplate/listAll')
    .get(controller.listAllData)

  router.route('/permissionTemplate/modules')
    .get(controller.readPermissionModules)

  router.route('/permissionTemplate/:permissionTemplateId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

  // Finish by binding the permissionMapping middleware
  router.param('permissionTemplateId', controller.permissionTemplateById)

  return router
}

