const Router = require('express-promise-router')

const controller = require('./agentReconciliationController');

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/getReconciliationList`)
        .post(controller.getReconciliationList);

    router.route(`/getReconciliationSummary`)
        .post(controller.getReconciliationSummary);
        
    return router
}