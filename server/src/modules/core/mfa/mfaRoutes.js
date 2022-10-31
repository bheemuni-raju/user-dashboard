const Router = require("express-promise-router");
const mfaController = require("./mfaController");
const { requestValidator, otpSchema } = require('./mfaValidator');
const { emailFromTokenMiddleware } = require('../user/userMiddleware');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route("/getQrCode")
        .get(mfaController.getQrCode);
    router.route("/verifyTotp")
        .post(requestValidator(otpSchema), emailFromTokenMiddleware, mfaController.verifyTotp);
    router.route("/enableMFA")
        .post(requestValidator(otpSchema), emailFromTokenMiddleware, mfaController.enableMFA);
    router.route("/disableMfa")
        .post(mfaController.disableMfa);

    return router;
};
