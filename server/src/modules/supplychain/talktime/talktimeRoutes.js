const Router = require('express-promise-router')

const controller = require('./talktimeController')

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/list`)
        .post(controller.listData);
    router.route(`/summary`)
        .post(controller.getSummary);
    router.route(`/mapTalktime`)
        .put(controller.mapTalktime);
    router.route(`/getTalktimeCohortSummary`)
        .post(controller.getTalktimeCohortSummary)

    return router
}