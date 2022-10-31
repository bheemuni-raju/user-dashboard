const { get } = require("lodash");

const batchService = require("../awsBatchService");

const listData = async (req, res) => {
  try {
    const dataList = (await batchService.listComputeEnvironments()) || [];
    const formattedListData = get(dataList, "data.computeEnvironments") || [];
    res.json({
      docs: formattedListData,
      limit: 10,
      page: 1,
      pages: 1,
      total: formattedListData.length,
    });
  } catch (e) {
    res.status(500).json({
      message: "Fetching job compute environments failed",
      error: e,
    });
  }
};

module.exports = {
  listData,
};
