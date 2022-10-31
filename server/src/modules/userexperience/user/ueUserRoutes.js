'use strict';

const Router = require('express-promise-router');
const uecontroller = require('./ueUserController');


const assignModel = (req, res, next) => {
    req.model = "UeEmployee";

    next();
}

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/createData').post(assignModel, uecontroller.createData);
    router.route('/listData').post(assignModel, uecontroller.listData);

    router.route('/readData/:email').get(assignModel, uecontroller.readData);

    router.route('/updateData').post(assignModel, uecontroller.updateUserDetails);
    router.route('/getComments').get(assignModel, uecontroller.getUserComments);
    router.route('/updateComments').put(assignModel, uecontroller.updateUserComments);

    return router;
};