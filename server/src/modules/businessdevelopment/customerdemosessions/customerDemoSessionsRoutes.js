const Router = require('express-promise-router')

const controller = require('./customerDemoSessionsController');

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/list`)
        .post(controller.listData);

    return router
}