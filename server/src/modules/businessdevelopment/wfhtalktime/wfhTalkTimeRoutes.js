const Router = require('express-promise-router')

const controller = require('./wfhTalkTimeController')

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
    router.route(`/rawTalktimeList`)
        .post(controller.rawTalktimeList);
    router.route(`/talktimeWebhookList`)
        .post(controller.talktimeWebhookList);
    router.route(`/talktimeSummary`)
        .post(controller.talktimeSummary);

    return router
}