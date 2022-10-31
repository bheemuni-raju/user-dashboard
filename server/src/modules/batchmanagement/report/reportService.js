const bunyan = require("bunyan");
const { ReportTemplate } = require("@byjus-orders/nexemplum/oms");

bunyan.createLogger({
  name: "Report service",
  env: process.env.NODE_ENV,
  serializers: bunyan.stdSerializers,
  src: true,
});

const groupByModuleCategory = async (filter) => {
  const stages = [
    {
      $match: {
        ...filter,
      },
    },
    {
      $group: {
        _id: "$moduleCategory",
        reports: {
          $addToSet: {
            name: "$name",
            formattedName: "$formattedName",
            _id: "$_id",
          },
        },
      },
    },
    {
      $addFields: {
        moduleCategory: "$_id",
      },
    },
    {
      $unset: ["_id"],
    },
  ];

  const finalList = await ReportTemplate.aggregate(stages);
  return finalList;
};

module.exports = {
  groupByModuleCategory,
};
