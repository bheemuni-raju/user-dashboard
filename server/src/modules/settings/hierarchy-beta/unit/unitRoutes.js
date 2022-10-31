const Router = require('express-promise-router')

const controller = require('./unitController')

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
    const router = defaultRoutes('unit', controller)
  
    router.route('/unit')
    .post(controller.createData)

    router.route('/unit/listAll')
    .get(controller.listAllData)

    router.route('/unit/:unitId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

    // Finish by binding the unit middleware
    router.param('unitId', controller.unitById)
  
    return router
  }
