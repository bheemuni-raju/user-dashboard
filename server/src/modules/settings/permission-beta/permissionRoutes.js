const Router = require('express-promise-router')
const controller = require('./permissionController')

const defaultRoutes = (routeName, controller) => {
  const router = Router({ mergeParams: true })

  router.route(`/${routeName}/colUniqueValues`)
    .get(controller.getColUniqueValues)
  router.route(`/${routeName}/download`)
    .post(controller.downloadData)

  return router
}

module.exports = () => {
  const router = defaultRoutes('permission', controller)

  router.route(`/list`)
    .post(controller.listData)

  router.route('/listAllApplications')
    .get(controller.listAllApplications)

  router.route('/')
    .post(controller.createData)

  router.route('/:permissionId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

  return router
}

