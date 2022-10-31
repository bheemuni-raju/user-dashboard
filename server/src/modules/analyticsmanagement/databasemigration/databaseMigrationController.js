const { size, isEmpty } = require("lodash");
const { SequelizeMeta } = require("@byjus-orders/npgexemplum");

const { sqlCriteriaBuilder } = require("../../../common/sqlCriteriaBuilder");

const listData = async (req, res) => {
  const {
    page,
    limit,
    sort,
    filter = {},
    searchCriterias = [],
    contextCriterias = [],
  } = req.body;
  const sqlFilter =
    size(filter) === 0
      ? sqlCriteriaBuilder(searchCriterias, contextCriterias)
      : filter;

  let sqlOrder = Object.keys(sort).map((item) => {
    const field = item.split(".");
    return [field[1], sort[item]];
  });

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

    const list = await SequelizeMeta.paginate(options);
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
};

module.exports = {
  listData,
};
