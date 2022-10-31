// eslint-disable-next-line strict
const Router = require('express-promise-router');
const inventoryController = require('./inventoryPicController');

const defaultRoutes = (routeName) => {
  const router = Router({ mergeParams: true })

  //This is default route which take all the pic inventory list
  router.route(`/${routeName}/list`).post(inventoryController.listData)
  return router
}

module.exports = () => {
  const router = defaultRoutes('pic', inventoryController)
  router.route(`/pic/addInventoryPic`)
    .post(inventoryController.addPicInventory);
  router.route(`/pic/addManagerInventoryPic`)
    .post(inventoryController.addManagerPicInventory);
  router.route(`/pic/removeManagerInventoryPic`)
    .post(inventoryController.removeManagerPicInventory);
  return router;
};