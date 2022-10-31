const Router = require('express-promise-router')
const controller = require('./departmentController')

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
  const router = defaultRoutes('department', controller)

  router.route('/department')
    .post(controller.createData)

  router.route('/department/listAll')
    .get(controller.listAllData)

  router.route('/department/getDetails')
    .post(controller.readByFormattedName)

  router.route('/department/:departmentId')
    .get(controller.readData)
    .put(controller.updateData)
    .delete(controller.deleteData)

  router.route('/department/:departmentId/property')
    .post(controller.createProperty)

  router.route('/department/:departmentId/property/:propertyId')
    .put(controller.updateProperty)
    .delete(controller.deleteProperty)

  router.route('/department/:departmentId/employees')
    .get(controller.readDepartmentEmployees)

  // Finish by binding the department middleware
  router.param('departmentId', controller.departmentById)
  router.param('propertyId', controller.propertyById)

  return router
}
