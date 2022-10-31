const Router = require('express-promise-router')
const controller = require('./controller')

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route(`/list`).post(controller.listData);
    router.route(`/updateData`).post(controller.updateData);
    router.route(`/getApplicationConfig`).post(controller.getApplicationConfig);

    return router
}