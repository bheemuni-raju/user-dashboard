'use strict';

const Router = require('express-promise-router');
const controller = require('./masterUserController');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/list').post(controller.listData);
    router.route('/read').post(controller.readData);
    router.route('/create').post(controller.createData);
    router.route('/update').post(controller.updateData);
    return router;
};
