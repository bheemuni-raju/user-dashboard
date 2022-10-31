const Router = require('express-promise-router');
const controller = require('./paymentController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    const routeName = "/byjusconfig/middleware/payment";

    router.route(`${routeName}/config`)
        .get(controller.getPaymentConfig)
        .put(controller.editPaymentConfig)
        .post(controller.addPaymentConfig)
        .delete(controller.deletePaymentConfig)

    return router;
}