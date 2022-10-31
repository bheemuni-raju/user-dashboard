const Router = require('express-promise-router')
const controller = require('./enumController')
const validator = require('./validator');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.post(`/list`, controller.listData);
    router.post(`/create`, validator.createEnum, controller.createEnum);
    router.post(`/update`, validator.createEnum, controller.updateEnum);
    router.get(`/:enumId`, controller.getEnum);
    return router
}