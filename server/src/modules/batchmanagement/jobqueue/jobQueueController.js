const { get } = require("lodash");

const batchService = require("../awsBatchService");

const listData = async (req, res) => {
  try {
    const dataList = (await batchService.listJobQueues()) || [];
    const formattedListData = get(dataList, "data.jobQueues") || [];
    res.json({
      docs: formattedListData,
      limit: 10,
      page: 1,
      pages: 1,
      total: formattedListData.length,
    });
  } catch (e) {
    res.status(500).json({
      message: "Fetching job queues failed",
      error: e,
    });
  }
};

module.exports = {
  listData,
};
