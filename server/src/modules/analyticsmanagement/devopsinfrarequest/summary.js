const moment = require("moment");
/* eslint-disable */
const sequelize = require("sequelize");
const { Op } = require("sequelize");
/* eslint-enable */
const { DevopsInfraRequest } = require("@byjus-orders/npgexemplum/common");

const { aggregatePaginate } = require("../../../common/sqlAggregateHelper");

const getStatusFields = (groupByField) => {
  let attributes = [];
  if (!groupByField || (groupByField && groupByField.includes("_at"))) {
    attributes = [
      [
        sequelize.fn(
          "sum",
          sequelize.literal("CASE WHEN status = 'created' THEN 1 ELSE 0 END")
        ),
        "createdRequests",
      ],
      [
        sequelize.fn(
          "sum",
          sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")
        ),
        "approvedRequests",
      ],
      [
        sequelize.fn(
          "sum",
          sequelize.literal(
            "CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END"
          )
        ),
        "inProgressRequests",
      ],
      [
        sequelize.fn(
          "sum",
          sequelize.literal("CASE WHEN status = 'deployed' THEN 1 ELSE 0 END")
        ),
        "deployedRequests",
      ],
      [
        sequelize.fn(
          "sum",
          sequelize.literal(
            "CASE WHEN status = 'smoke_tested' THEN 1 ELSE 0 END"
          )
        ),
        "smokeTestedRequests",
      ],
      [
        sequelize.fn(
          "sum",
          sequelize.literal("CASE WHEN status = 'rejected' THEN 1 ELSE 0 END")
        ),
        "rejectedRequests",
      ],
      [
        sequelize.fn(
          "sum",
          sequelize.literal("CASE WHEN status = 'audited' THEN 1 ELSE 0 END")
        ),
        "auditedRequests",
      ],
      [sequelize.fn("count", 1), "totalRequests"],
    ];
  } else {
    attributes = [[sequelize.fn("count", 1), "totalRequests"]];
  }
  if (groupByField) {
    attributes.push([groupByField, "_id"]);
  }

  return attributes;
};

const getGraphQuery = (params) => {
  const {
    startDate,
    endDate,
    groupBy,
    sort,
    team,
    isStatsData = false,
  } = params;

  const formattedStartDate = moment(startDate).startOf("day").toDate();
  const formattedEndDate = moment(endDate).endOf("day").toDate();

  const filterCreatedDate = {
    // eslint-disable-next-line camelcase
    created_at: {
      [Op.between]: [formattedStartDate, formattedEndDate],
    },
  };
  const filterUpdatedDate = {
    // eslint-disable-next-line camelcase
    updated_at: {
      [Op.between]: [formattedStartDate, formattedEndDate],
    },
  };

  const filterBy =
    // eslint-disable-next-line eqeqeq
    (groupBy == "updated_at" ? filterUpdatedDate : filterCreatedDate) ||
    filterCreatedDate;

  if (team && team !== "all") {
    filterBy.team = {
      [Op.eq]: team,
    };
  }

  const sqlOrder =
    groupBy && sort
      ? Object.keys(sort).map((item) => {
          return [groupBy, sort[item]];
        })
      : [];

  const query = {
    attributes: getStatusFields(groupBy),
    where: isStatsData ? {} : filterBy,
    order: sqlOrder,
    raw: true,
  };

  if (groupBy) {
    query.group = [groupBy];
  }
  return query;
};

const getCalendarQuery = (params) => {
  const { startDate, endDate, groupBy, sort, team } = params;

  const formattedStartDate = moment(startDate).startOf("day").toDate();
  const formattedEndDate = moment(endDate).endOf("day").toDate();

  const filterCalendarDate = {
    // eslint-disable-next-line camelcase
    created_at: {
      [Op.between]: [formattedStartDate, formattedEndDate],
    },
  };

  const filterBy = filterCalendarDate;

  if (team && team !== "all") {
    filterBy.team = {
      [Op.eq]: team,
    };
  }

  const sqlOrder =
    groupBy && sort
      ? Object.keys(sort).map((item) => {
          return [groupBy, sort[item]];
        })
      : [];

  const query = {
    attributes: ["created_at"],
    where: filterBy,
    order: sqlOrder,
    raw: true,
  };

  return query;
};

const getDevopsInfraRequestOverview = async (req, res) => {
  const { startDate, endDate, groupBy, team, sort } = req.body;

  const graphQuery = getGraphQuery({ startDate, endDate, groupBy, team, sort });
  const tableQuery = getGraphQuery({
    startDate,
    endDate,
    groupBy: null,
    team,
    isTableData: true,
    sort,
  });
  const statsQuery = getGraphQuery({
    startDate,
    endDate,
    groupBy: null,
    team,
    isStatsData: true,
    sort,
  });
  const calendarQuery = getCalendarQuery({
    startDate,
    endDate,
    groupBy,
    team,
    sort,
  });

  const graphData = await DevopsInfraRequest.findAll(graphQuery);
  const tableData = await DevopsInfraRequest.findAll(tableQuery);
  const statsData = await DevopsInfraRequest.findAll(statsQuery);
  const calendarData = await DevopsInfraRequest.findAll(calendarQuery);

  const finalStats = {
    graphData,
    tableData,
    statsData,
    calendarData,
  };

  return res.json(finalStats);
};

const getSummaryData = async (req, res) => {
  const { groupByField = "team", startDate, endDate } = req.query;

  const formattedStartDate = moment(startDate).startOf("day").toDate();
  const formattedEndDate = moment(endDate).endOf("day").toDate();

  const filterCreatedDate = {
    // eslint-disable-next-line camelcase
    created_at: {
      [Op.between]: [formattedStartDate, formattedEndDate],
    },
  };
  const filterUpdatedDate = {
    // eslint-disable-next-line camelcase
    updated_at: {
      [Op.between]: [formattedStartDate, formattedEndDate],
    },
  };

  const filterBy =
    // eslint-disable-next-line eqeqeq
    groupByField == "updated_at"
      ? filterUpdatedDate
      : filterCreatedDate || filterCreatedDate;

  const { page = 1, limit = 10, sort = {} } = req.body;

  const sqlOrder = Object.keys(sort).map((item) => {
    return [groupByField, sort[item]];
  });

  try {
    const options = {
      attributes: [
        [groupByField, "_id"],
        [
          sequelize.fn(
            "sum",
            sequelize.literal("CASE WHEN status = 'created' THEN 1 ELSE 0 END")
          ),
          "createdRequests",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")
          ),
          "approvedRequests",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal("CASE WHEN status = 'deployed' THEN 1 ELSE 0 END")
          ),
          "deployedRequests",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              "CASE WHEN status = 'smoke_tested' THEN 1 ELSE 0 END"
            )
          ),
          "smokeTestedRequests",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal("CASE WHEN status = 'rejected' THEN 1 ELSE 0 END")
          ),
          "rejectedRequests",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal("CASE WHEN status = 'audited' THEN 1 ELSE 0 END")
          ),
          "auditedRequests",
        ],
        [sequelize.fn("count", 1), "totalRequests"],
      ],
      group: [groupByField],
      where: filterBy,
      order: sqlOrder,
      limit,
      page,
    };

    const list = await aggregatePaginate({
      options,
      model: DevopsInfraRequest,
    });
    return res.json({
      ...list,
      page,
      limit,
    });
  } catch (error) {
    console.log(`Error during accessing summary data`, error);
    return res.status(500).json({
      message: "Error during accessing summary data!",
      error: error.message,
    });
  }
};

module.exports = {
  getSummaryData,
  getDevopsInfraRequestOverview,
};
