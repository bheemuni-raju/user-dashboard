const Router = require('express-promise-router')

const controller = require('./manageSopController')

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/list`)
        .post(controller.listData);
    router.route(`/summary`)
        .post(controller.getSummary);
    router.route(`/generateSopTrackerReport`)
        .post(controller.generateSopTrackerReport);
    router.route(`/getPerformanceRatingSummary`)
        .post(controller.getPerformanceRatingSummary);

    return router
}