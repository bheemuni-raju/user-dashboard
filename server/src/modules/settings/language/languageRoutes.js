const Router = require('express-promise-router');
const controller = require('./languageController');

module.exports = () => {
    const router = Router({ mergeParams: true });
  
    router.route(`/list`)
      .post(controller.getLanguagesList);

      return router;
}