const Router = require('express-promise-router')

const controller = require('./verticalController')

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
    const router = defaultRoutes('vertical', controller)
  
    router.route('/vertical')
    .post(controller.createData)

    router.route('/vertical/listAll')
    .get(controller.listAll)

    router.route('/vertical/:verticalId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

    // Finish by binding the team middleware
    router.param('verticalId', controller.verticalById)
  
    return router
  }
