const Router = require('express-promise-router')
const controller = require('./subDepartmentController')

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
  const router = defaultRoutes('subDepartment', controller)

  router.route('/subDepartment')
    .post(controller.createData)

  router.route('/subDepartment/listAll')
    .get(controller.listAllData)

  router.route('/subDepartment/:subDepartmentId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

  router.route('/subDepartment/details')
    .post(controller.getTeamDetailsBySubDepartment)

  // Finish by binding the subDepartment middleware
  router.param('subDepartmentId', controller.subDepartmentById)

  return router
}
