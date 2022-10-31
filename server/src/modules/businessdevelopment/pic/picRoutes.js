// eslint-disable-next-line strict
const Router = require('express-promise-router');
const inventoryController = require('./inventory/inventoryPicController');
const salesPicController = require('./salespics/salesPicController');

module.exports = () => {
  const router = Router({ mergeParams: true })

  router.route(`/inventory/list`)
    .post(inventoryController.listData);

  router.route(`/inventory/addPic`)
    .post(inventoryController.addPicInventory);

  router.route(`/inventory/addManagerPic`)
    .post(inventoryController.addManagerPicInventory);

  router.route(`/inventory/removeManagerPic`)
    .post(inventoryController.removeManagerPicInventory);

  router.route(`/salespics/getPicList`)
    .post(salesPicController.listData);

  router.route(`/salespics/createPic`)
    .post(salesPicController.createPic);
    
  router.route(`/salespics/changePicStatus`)
    .post(salesPicController.changePicStatus);

  router.route(`/salespics/editCoveringUsers`)
    .post(salesPicController.editCoveringUsers);

  return router;
};