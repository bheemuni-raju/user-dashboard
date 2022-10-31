const Router = require("express-promise-router");

const developerTokenController = require("./developerTokenController");

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route("/generate")
    .post(developerTokenController.generateToken);
    router.route("/delete")
    .post(developerTokenController.deleteToken);    
    router.route("/tokenexpiry")
    .post(developerTokenController.getDeveloperTokenExpiry);
    
    return router;
};
