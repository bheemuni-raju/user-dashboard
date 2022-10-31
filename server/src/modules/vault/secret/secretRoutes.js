const Router = require('express-promise-router');

const controller = require('./secretController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/list').post(controller.listSecret);
    router.route('/create').post(controller.createSecret);
    router.route('/update')
        .put(controller.updateSecret)
        .delete(controller.deleteSecret);
    router.route('/secretList').post(controller.getSecretListByPoolId);
    router.route('/bulkCreate').post(controller.bulkSecretCreate)

    return router;
};