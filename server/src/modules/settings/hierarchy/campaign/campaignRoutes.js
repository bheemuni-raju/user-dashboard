const Router = require('express-promise-router')

const controller = require('./campaignController')

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
    const router = defaultRoutes('campaign', controller)
  
    router.route('/campaign')
    .post(controller.createData)

    router.route('/campaign/listAll')
    .get(controller.listAll)

    router.route('/campaign/:campaignId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

    // Finish by binding the team middleware
    router.param('campaignId', controller.campaignById)
  
    return router
  }