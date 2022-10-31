const Router = require('express-promise-router')
const controller = require('./roleController')

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
  const router = defaultRoutes('role', controller)

  router.route('/role')
    .post(controller.createData)

  router.route('/role/subdepartmentroles')
    .get(controller.listAllTeamRoles)

  router.route('/role/:roleId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

  // Finish by binding the team middleware
  router.param('roleId', controller.roleById)

  return router
}
