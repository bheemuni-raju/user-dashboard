const mongoose = require('mongoose');
const flatten = require('flat');
const Json2csvParser = require('json2csv').Parser;

const downloadAchFile = async (req, res) => {
  const { model, select, filter = {} } = req.body;
  const updatedFilter = {
    "emiSchedules.scheduledDate": filter && { "$eq": new Date(filter.emiScheduleDate) },
    "status": filter && { $in: [filter.status] }
  }
  
  const ModelName = mongoose.models[model];
  const actualRecords = await ModelName.find(updatedFilter).select(select).lean();
  const records = actualRecords.map(ele => flatten(JSON.parse(JSON.stringify(ele))));
  const json2csvParser = new Json2csvParser({ fields: select });
  const csvContent = json2csvParser.parse(records);

  res.setHeader('Content-disposition', `attachment; filename=${model}.csv`);
  res.setHeader('Content-Type', 'text/csv');
  return res.send(csvContent);
}

module.exports = {
  downloadAchFile
}
