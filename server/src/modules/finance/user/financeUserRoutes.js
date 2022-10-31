'use strict';

const Router = require('express-promise-router');

const financeUserController = require('./financeUserController');

const assignModel = (req, res, next) => {
    req.model = "FinanceEmployee";

    next();
}

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/listData').post(assignModel, financeUserController.listData);
    router.route('/createData').post(assignModel, financeUserController.createData);
    router.route('/updateData').post(assignModel, financeUserController.updateUserDetails);
    router.route('/readData/:email').get(assignModel, financeUserController.readData);
    router.route('/getComments').get(assignModel, financeUserController.getUserComments);
    router.route('/updateComments').put(assignModel, financeUserController.updateUserComments);
    return router;
};
