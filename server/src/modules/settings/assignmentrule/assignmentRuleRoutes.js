const Router = require('express-promise-router')
const controller = require('./assignmentRuleController')

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route(`/list`)
        .post(controller.listData)

    router.route('/')
        .post(controller.createData)

    router.route('/:ruleFormattedName')
        .get(controller.readData)
        .put(controller.updateData)
        .delete(controller.deleteData)

    // Finish by binding the team middleware
    router.param('ruleFormattedName', controller.ruleByFormattedName)

    router.route(`/listGridTemplate`)
        .post(controller.listGridTemplate)

    return router
}