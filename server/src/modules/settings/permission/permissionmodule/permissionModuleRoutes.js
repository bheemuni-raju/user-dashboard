const Router = require('express-promise-router')
const controller = require('./permissionModuleController')

const defaultRoutes = (routeName, controller) => {
    const router = Router({mergeParams: true})
   
    router.route(`/${routeName}/list`)
      .post(controller.listData)
    router.route(`/${routeName}/colUniqueValues`)
      .get(controller.getColUniqueValues)
    router.route(`/${routeName}/download`)
      .post(controller.downloadData)
  
    return router
  }

  module.exports = () => {
    const router = defaultRoutes('permissionModule', controller)
  
    router.route('/permissionModule')
    .post(controller.createData)

    router.route('/permissionModule/listAll')
    .get(controller.listAllData)

    router.route('/permissionModule/modules')
    .get(controller.readPermissionModules)

    router.route('/permissionModule/:permissionModuleId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

    // Finish by binding the permissionMapping middleware
    router.param('permissionModuleId', controller.permissionModuleById)
  
    return router
  }

