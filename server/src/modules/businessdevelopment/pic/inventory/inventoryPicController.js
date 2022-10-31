const { get, isEmpty } = require("lodash");
const { Employee, InventoryPic } = require('@byjus-orders/nexemplum/ums');

const logger = require('../../../../lib/bunyan-logger')('inventoryPicController');
const commonController = require('../../../../common/dataController');

const addPicInventory = async (req, res) => {
  const { email } = req.body;
  logger.info({ method: 'addPicInventory' }, 'add a pic in pic inventory', JSON.stringify(req.body))

  if (!email) throw new Error(`email is missing`);
  try {
    const empData = await Employee.findOne({ email });
    const picInventoryData = await InventoryPic.findOne({ pic_email_id: { $in: [email.toLowerCase(), email] } }).lean();

    if (isEmpty(picInventoryData)) {
      const newInventoryData = new InventoryPic({
        pic_email_id: email,
        pic_tnl_id: get(empData, "tnlId", "")
      });

      await newInventoryData.save();
      res.status(200).json({ message: 'added successfully' });
    } else {
      throw new Error(`Pic ${email} already exists`);
    }
  } catch (error) {
    logger.error({ method: 'createData' }, error)
    throw new Error(error);
  }
}

const addManagerPicInventory = async (req, res) => {
  const { email, picEmail } = req.body;
  logger.info({ method: 'addManagerPicInventory' }, 'add team manager inside pic', JSON.stringify(req.body))

  if (!email && !picEmail) throw new Error(`email is missing`)
  else {
    try {
      const empData = await Employee.findOne({ email });
      const doc = await InventoryPic.findOne({ 'team_managers.team_manager_email_id': email, pic_email_id: picEmail });
      if (!doc) {
        await InventoryPic.findOneAndUpdate({ "pic_email_id": { $in: [picEmail.toLowerCase(), picEmail] } }, {
          $push: {
            team_managers: {
              team_manager_tnl_id: get(empData, "tnlId", ""),
              team_manager_email_id: email
            }
          }
        });
        res.json({ success: true })
      } else {
        res.json({ success: false })
      }
    } catch (error) {
      throw new Error(error)
    };
  }
}

const removeManagerPicInventory = async (req, res) => {
  const { picEmail, teamManagerEmail } = req.body;
  logger.info({ method: 'removeManagerPicInventory' }, 'remove manager from inventory pic', JSON.stringify(req.body))

  if (isEmpty(teamManagerEmail)) { throw new Error(error); }
  else {
    try {
      await InventoryPic.findOneAndUpdate({ "pic_email_id": { $in: [picEmail.toLowerCase(), picEmail] } }, {
        $pull: {
          team_managers: { team_manager_email_id: teamManagerEmail }
        }
      });
      res.json(`Removed TM succesfully`);
    } catch (error) { throw new Error(error); }
  }
}



module.exports = {
  ...commonController,
  addPicInventory,
  addManagerPicInventory,
  removeManagerPicInventory
};
