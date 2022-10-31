const { NotificationChannel } = require("@byjus-orders/npgexemplum");
const { size, isEmpty } = require("lodash");

const { sqlCriteriaBuilder } = require("../../../common/sqlCriteriaBuilder");

const notificationChannelList = async (req, res) => {

  const { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
        const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;
        let sqlOrder = Object.keys(sort).map(item => [...item.split('.'), sort[item]]);

  try {
    if (isEmpty(sqlOrder)) {
      sqlOrder = [["createdAt", "DESC"]];
    }

    const options = {
      page: page || 1,
      paginate: limit || 10,
      order: sqlOrder,
      where: sqlFilter,
    };
    
    const NotificationChannelData = await NotificationChannel.paginate(options);

    if (!NotificationChannelData)
      return res.status(400).send("Failed to fetch application type list");

    return res.sendWithMetaData(NotificationChannelData);
  } catch (err) {
    return res.status(400).json({ error: err.message, message: "Api failed" });
  }
};

const createNotificationChannel = async (req, res) => {
  const { name, formattedName, createdBy } = req.body;

  if (!name || !formattedName || !createdBy) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const CreatedNotificationChannelData = await NotificationChannel.create({
      name,
      formattedName,
      isActive: "true",
      createdBy,
    });

    if (!CreatedNotificationChannelData)
      return res.send("Failed to create Notification Channel");

    return res.status(201).json(CreatedNotificationChannelData);
  } catch (err) {
    return res.status(400).json({ error: err.message, message: "api failed" });
  }
};

const updateNotificationChannel = async (req, res) => {
  const { name, formattedName, updatedBy , id = req.params } = req.body;

  if (!name || !formattedName || !updatedBy) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedNotificationChannel = await NotificationChannel.update(
      {
        name,
        formattedName,
        updatedBy,
      },
      {
        where: { id },
      }
    );

    if (!updatedNotificationChannel)
      return res.send("Failed to update Notification Channel");

    return res.status(200).json(updatedNotificationChannel);
  } catch (err) {
    return res.status(400).json({ error: err.message, message: "Api failed" });
  }
};

const deleteNotificationChannel = async (req, res) => {
  const { id, isActive } = req.body;

  if (!id) return res.status(400).json({ message: "id is required" });

  try {
    const deletedNotificationChannel = await NotificationChannel.update(
      { isActive },
      { where: { id } }
    );

    if (!deletedNotificationChannel)
      return res.status(404).send("Record not exists with this id.");

    return res.json(deletedNotificationChannel);
  } catch (err) {
    return res.status(400).json({ error: err.message, message: "Api failed" });
  }
};

module.exports = {
  notificationChannelList,
  createNotificationChannel,
  updateNotificationChannel,
  deleteNotificationChannel,
};
