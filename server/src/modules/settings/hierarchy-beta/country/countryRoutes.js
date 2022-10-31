const Router = require('express-promise-router')

const controller = require('./countryController')

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
    const router = defaultRoutes('country', controller)
  
    router.route('/country')
    .post(controller.createData)

    router.route('/listAll')
    .get(controller.listAll)

    router.route('/country/:countryId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

    // Finish by binding the team middleware
    router.param('countryId', controller.countryById)
  
    return router
  }