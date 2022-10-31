'use strict';

const Router = require('express-promise-router');
const controller = require('./userController');
const formController = require('./formTemplateController');
const validator = require('../user/userValidator');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/listData').post(controller.listData);
    router.route('/createData').post(controller.createData);
    router.route('/updateData').post(controller.updateUserDetails);
    router.route('/getComments').get(controller.getUserComments);
    router.route('/updateComments').put(controller.updateUserComments);

    router.route('/getUserFormTemplate/:department').get(formController.getUserFormTemplate);
    router.route('/createUserFormTemplate').post(validator.validateUserFormTemplateSchema, formController.createUserFormTemplate);
    router.route('/updateUserFormTemplate').put(validator.validateUserFormTemplateSchema, formController.updateUserFormTemplate);

    return router;
};
