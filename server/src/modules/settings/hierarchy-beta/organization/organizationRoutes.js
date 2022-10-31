const Router = require('express-promise-router')

const controller = require('./organizationController')

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
    const router = defaultRoutes('organization', controller)
  
    router.route('/organization')
    .post(controller.createData)

    router.route('/listAll')
    .get(controller.listAll)

    router.route('/organization/:organizationId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

    // Finish by binding the team middleware
    router.param('organizationId', controller.organizationById)
  
    return router
  }