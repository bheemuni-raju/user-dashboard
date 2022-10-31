const mongoose = require("mongoose");

const { criteriaBuilder } = require("../../../common/dataController");

const getAggregateStages = ({ groupByField, filter, req }) => {
  const { startDate, endDate } = req.query;

  return [
    // Stage 1
    {
      $match: {
        ...filter,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    // Stage 2
    {
      $group: {
        _id: `$${groupByField}`,
        total: { $sum: 1.0 },
      },
    },
  ];
};

const getSummary = async (req, res) => {
  const { page, limit, searchCriterias = [], contextCriterias = [] } = req.body;
  let { sort } = req.body;
  const { groupByField = "scheduledBy" } = req.query;
  const modelName = mongoose.models.Job;

  if (Object.keys(sort).length === 0) {
    sort = { _id: -1 };
  }

  const filter = criteriaBuilder(searchCriterias, contextCriterias);

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sortBy: sort,
    };

    const stages = getAggregateStages({ groupByField, filter, req });
    const aggregate = modelName.aggregate(stages);
    const summaryList = await modelName.aggregatePaginate(aggregate, options);
    // Transform the api response to fit byjusGrid react component
    res.json({
      docs: summaryList.data,
      total: summaryList.totalCount,
      pages: summaryList.pageCount,
      limit,
      page,
    });
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
};

module.exports = {
  getSummary,
};
