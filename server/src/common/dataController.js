const mongoose = require('mongoose');
const flatten = require('flat');
const Json2csvParser = require('json2csv').Parser;
const csv = require('fast-csv');
const { size, get } = require('lodash');

const { UserPreference } = require('@byjus-orders/nexemplum/ums');
const { GridTemplate } = require('@byjus-orders/nexemplum/oms');
const Model = require('@byjus-orders/npgexemplum');
const MsModel = require('@byjus-orders/nmsexemplum');

const { criteriaBuilder } = require('./criteriaBuilder');
const Utils = require('../lib/utils');
const bunyan = require('../lib/bunyan-logger');
const logger = bunyan('dataController');
const { BadRequestError, SimulatedError } = require('../lib/errors')

const ModelMap = {
  'postgres': Model,
  'mysqldb': MsModel
};
/**
* List of grid data
*/
const listData = async (req, res) => {
  let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
  filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select
    }
    
    let ModelName = mongoose.models[model];

    if (!ModelName && db) {
      ModelName = mongoose[db] && mongoose[db].models[model];
    }

    if(ModelName?.paginate){
      const list = await ModelName.paginate(filter, options)
      return res.sendWithMetaData(list);
    }

    throw new BadRequestError('Invalid Request : Failed to fetch grid data');
  } catch (error) {
    logger.error({ method: 'listData' },`Error in fetching grid data : ${error.message}`);
    return res.status(500).send({
      status: "error",
      message: "Failed to fetch grid data, Internal Server Error"
    });
  }
}

const getGridViews = async (req) => {
  let { email, permissions } = get(req, "user", {});

  //const isAdminUser = permissions.includes(get(user, 'impersonate', ''));
  let advanceFilter = {};

  //if (!isAdminUser) {
  advanceFilter = {
    "$or": [
      { shareWith: { "$in": ["everyone", null] } },
      { createdBy: email }
    ]
  };
  //}

  let { gridId } = req.body;
  let gridConfig = {};

  if (gridId) {
    gridConfig = await GridTemplate.find({
      gridId,
      ...advanceFilter
    });
  }

  return gridConfig;
}


const getColUniqueValues = async (req, res) => {
  const { model, select, populate, column } = req.query;

  //const fields = select && select.split(",") || column
  const ModelName = mongoose.models[model];

  try {
    const result = await ModelName.distinct(column);
    res.json(result);
  }
  catch (err) {
    logger.info(`Error in getColUniqueValues method : ${err.message}`);
    throw err.message || err;
  }
}

const downloadData = async (req, res) => {
  const { model, select, filter = {} } = req.body;
  const ModelName = mongoose.models[model];
  const actualRecords = await ModelName.find(filter).select(select).lean();
  const records = actualRecords.map(ele => flatten(JSON.parse(JSON.stringify(ele))));
  const headers = getHeaders(records);
  const json2csvParser = new Json2csvParser({ fields: select });
  const csvContent = json2csvParser.parse(records);

  res.setHeader('Content-disposition', `attachment; filename=${model}.csv`);
  res.setHeader('Content-Type', 'text/csv');
  return res.send(csvContent);
}

const getHeaders = (records) => {
  const headerMap = {};
  records.forEach(ele => {
    Object.keys(ele).forEach(key => headerMap[key] = 1);
  });
  const headers = Object.keys(headerMap).sort();

  // Remove partial keys
  const uniqueHeaders = [];
  headers.forEach((ele, indx) => {
    if (indx === headers.length - 1) {
      uniqueHeaders.push(ele);
    } else {
      const secondPart = headers[indx + 1].split(ele)[1];
      if (secondPart === undefined || secondPart[0] !== ".") {
        uniqueHeaders.push(ele);
      }
    }
  });
  return uniqueHeaders;
}

const readCsvFile = (req, res, callback) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  return new Promise((resolve, reject) => {
    const fileBuffer = req.file.buffer;
    const records = [];
    csv.fromString(fileBuffer.toString(), {
      headers: true,
      ignoreEmpty: true
    })
      .on("data", (data) => {
        records.push(data);
      })
      .on("end", () => {
        resolve(records);
      })
  })
}

const processCsvFile = async (records, modelName, uniqueCol) => {
  const newRecords = []; const existingRecords = []; const invalidRecords = []

  for (let i = 0; i < records.length; i++) {
    try {
      await new modelName(records[i]).validate()

      const isExisting = await modelName.findOne({ [uniqueCol]: records[i][uniqueCol] })

      if (!isExisting) {
        newRecords.push({
          ...records[i],
          err: null,
          index: i + 1
        })
      }
      else {
        existingRecords.push({
          ...records[i],
          err: null,
          index: i + 1
        })
      }
    }
    catch (e) {
      invalidRecords.push({
        ...records[i],
        err: e.message,
        index: i + 1
      })
    }
  }

  return {
    newRecords: newRecords || [],
    existingRecords,
    invalidRecords
  }
}

/**
* Bulk-upsert an array of records
* @param  {Array}    records  List of records to update
* @param  {Model}    Model    Mongoose model to update
* @param  {Object}   match    Database field to match
* @return {Promise}  always resolves a BulkWriteResult
*/
const bulkUpdate = (records, Model, match) => {
  match = match || 'id';
  if (records.length) {
    return new Promise(((resolve, reject) => {
      const bulk = Model.collection.initializeUnorderedBulkOp()
      records.forEach((record) => {
        const query = {};
        query[match] = record[match];
        bulk.find(query).upsert().updateOne(record);
      })
      bulk.execute((err, bulkres) => {
        if (err) return reject(err)
        resolve(bulkres);
      });
    }));
  }
  else {
    return [];
  }
}

const storeCsvFile = async (processedRecords, modelName, uniqueCol) => {
  const { newRecords, existingRecords } = processedRecords
  const createdRecs = newRecords.length > 0 && await modelName.insertMany(newRecords)
  const updatedRecs = await bulkUpdate(existingRecords, modelName, uniqueCol)

  console.log(createdRecs, updatedRecs)
}

const uploadCsvFile = async (req, res, operationType) => {
  try {
    const { model, uniqueCol } = req.body
    const modelName = mongoose.models[req.body.model];
    const records = await readCsvFile(req, res);
    const processedRecords = await processCsvFile(records, modelName, uniqueCol);
    (operationType === "import") && await storeCsvFile(processedRecords, modelName, uniqueCol);
    res.json({
      ...processedRecords,
      message: `${operationType} successfully done.`
    });
  }
  catch (e) {
    // throw Error(`Issue while ${operationType}, please try again.`)
    res.status(500).json({
      message: `${operationType} failed.`,
      error: e.message
    });
  }
}

const uploadData = async (req, res) => {
  uploadCsvFile(req, res, "upload")
}

const importData = async (req, res) => {
  uploadCsvFile(req, res, "import")
}

/**
 * Returns Dynamic Grid Template
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const gridFormField = async (req, res) => {
  try {
    const { type } = req.params;
    const FormFields = await GridTemplate.findOne(
      { gridId: type },
      { columns: 1 }
    );
    res.status(200).json({ message: 'success', resp: FormFields.columns });
  } catch (error) {
    res.status(500).json({ message: 'failure', resp: error });
  }
}

/** Get List of models/collection registered with mongoose connected DB's */
const getModelList = async (req, res) => {
  const { database } = req.body;
  const dbConnectionMap = Utils.dbConnectionMap || {};

  try {
    const dbData = (database ? mongoose[dbConnectionMap[database]] : mongoose) || mongoose;
    if (dbData) {
      const collections = (dbData.models || {});

      const collectionArray = Object.keys(collections).map(collection => {

        return get(collections[collection], 'collection.collectionName')
      })

      res.json(collectionArray.sort());
    }
    else {
      throw new Error(`Database ${database} doesn't exist`);
    }
  } catch (error) {
    throw new Error(`Error in fetching details of Database ${database} - ${error}`);
  }
}

getColumnList = async (req, res) => {
  const { model, database } = req.body;
  const dbConnectionMap = Utils.dbConnectionMap || {};

  if (!model) throw new Error('model is required');

  try {
    const dbData = (database ? mongoose[dbConnectionMap[database]] : mongoose) || mongoose;
    if (dbData) {
      // const modelDataArray = map(Object.values(dbData.models), 'collection');
      // const modelData = find(modelDataArray, { 'collectionName': model });
      let modelData = {};
      const modelDataList = dbData.models;
      Object.keys(modelDataList).map(key => {
        if (modelDataList[key].collection.collectionName === model) {
          modelData = modelDataList[key];
        }
      })

      if (modelData) {
        const schemaPaths = get(modelData, 'schema.paths', {});

        const columnArray = Object.keys(schemaPaths) || [];

        res.json(columnArray.sort());
      }
      else {
        throw new Error(`Model ${model} doesn't exist`);
      }
    }
    else {
      throw new Error(`Database ${database} doesn't exist`);
    }
  } catch (error) {
    throw new Error(`Error in fetching details of Database ${database} - ${error}`);
  }
}

const getPgModelList = async (req, res) => {
  try {
    const tableArray = Object.keys(Model);
    res.json(tableArray.sort());
  } catch (error) {
    throw new Error(`Error in fetching details of Database ${database} - ${error}`);
  }
}

const getPgModelAssociations = async (req, res) => {
  logger.info({ method: 'getPgModelAssociations' }, 'Request params : ', JSON.stringify(req?.params));
  const { params: { modelName } } = req;
  if (!modelName) {
    logger.error({ method: 'getPgModelAssociations' }, 'Invalid Request : Required parameters missing');
    throw new BadRequestError('Invalid Request : Required parameters missing');
  }

  try {
    const modelAssociations = Model?.sequelize?.models[modelName]?.associations;
    const models = Object.values(modelAssociations ?? {}).map(m => m?.target?.name);
    res.json(models);
  } catch (err) {
    logger.error({ method: 'getPgModelAssociations' }, 'exception occured during fetching models associations :', err.message);
    throw err;
  }
}

const getPgModelAssociatedColumns = async (req, res) => {
  logger.info({ method: 'getPgModelAssociatedColumns' }, 'Request Body : ', JSON.stringify(req?.body));
  const { body: { modelNames = [] } } = req;
  if (!modelNames && Array.isArray(modelNames) && modelNames.length > 0) {
    logger.error({ method: 'getPgModelAssociatedColumns' }, 'Invalid Request : Required parameters missing');
    throw new BadRequestError('Invalid Request : Required parameters missing');
  }

  try {
    let columnArray = [];
    for (const name of modelNames) {
      for (let key in Model[name].rawAttributes) {
        columnArray.push({ dataField: `${name}.${key}`, dataType: Model[name].rawAttributes[key].type.key });
      }
    }
    res.json(columnArray);
  } catch (err) {
    logger.error({ method: 'getPgModelAssociatedColumns' }, 'exception occured during fetching models attributes :', err.message);
    throw err;
  }
}

const getPgColumnList = async (req, res) => {
  const { modelName } = req.body;
  let columnArray = [];
  for (let key in Model[modelName].rawAttributes) {
    columnArray.push({ dataField: key, dataType: Model[modelName].rawAttributes[key].type.key });
  }
  res.json(columnArray);
}

const getSQLModelList = async (req, res) => {
  try {
    const { dbType } = req.body;
    const model = ModelMap[dbType];
    const tableArray = Object.keys(model);
    res.json(tableArray.sort());
  } catch (error) {
    throw new Error(`Error in fetching details of Database ${database} - ${error}`);
  }
}

const getSQLModelAssociations = async (req, res) => {
  logger.info({ method: 'getSQLModelAssociations' }, 'Request params : ', JSON.stringify(req?.params));
  const { params: { modelName } } = req;
  const { databaseType } = req.query;
  const model = ModelMap[databaseType]
  if (!modelName) {
    logger.error({ method: 'getSQLModelAssociations' }, 'Invalid Request : Required parameters missing');
    throw new BadRequestError('Invalid Request : Required parameters missing');
  }

  try {
    const modelAssociations = model?.sequelize?.models[modelName]?.associations;
    const models = Object.values(modelAssociations ?? {}).map(m => m?.target?.name);
    res.json(models);
  } catch (err) {
    logger.error({ method: 'getSQLModelAssociations' }, 'exception occured during fetching models associations :', err.message);
    throw err;
  }
}

const getSQLModelAssociatedColumns = async (req, res) => {
  logger.info({ method: 'getSQLModelAssociatedColumns' }, 'Request Body : ', JSON.stringify(req?.body));
  const { body: { modelNames = [], databaseType } } = req;
  const model = ModelMap[databaseType]
  if (!modelNames && Array.isArray(modelNames) && modelNames.length > 0) {
    logger.error({ method: 'getSQLModelAssociatedColumns' }, 'Invalid Request : Required parameters missing');
    throw new BadRequestError('Invalid Request : Required parameters missing');
  }

  try {
    let columnArray = [];
    for (const name of modelNames) {
      for (let key in model[`${name}`].rawAttributes) {
        columnArray.push({ dataField: `${name}.${key}`, dataType: model[name].rawAttributes[key].type.key });
      }
    }
    res.json(columnArray);
  } catch (err) {
    logger.error({ method: 'getSQLModelAssociatedColumns' }, 'exception occured during fetching models attributes :', err.message);
    throw err;
  }
}

const getSQLColumnList = async (req, res) => {
  const { modelName, databaseType = 'postgres' } = req.body;
  const model = ModelMap[databaseType]
  let columnArray = [];
  for (let key in model[modelName].rawAttributes) {
    columnArray.push({ dataField: key, dataType: model[modelName].rawAttributes[key].type.key });
  }
  res.json(columnArray);
}


/** Saves User prefereces */
const saveUserPreferences = async (req, res) => {
  try {
    const { emailId, gridId, searchCriterias, conditionType, quick_filter_name } = req.body
    const preference = await UserPreference.findOne({ email: emailId, gridId })
    let quickFilter = {}
    if (!preference) {
      const advanceSearchList = []
      advanceSearchList.push({
        formattedName: Utils.formatName(quick_filter_name),
        name: quick_filter_name,
        query: searchCriterias
      })
      const user = new UserPreference({
        email: emailId,
        gridId,
        advanceSearch: advanceSearchList
      })
      await user.save()
      quickFilter = {
        exists: false,
        message: 'Favourite Filter created Successfully!!'
      }
    } else {
      const queryCount = preference.advanceSearch.length
      if (queryCount < 10) {
        const advanceSearchList = []
        advanceSearchList.push({
          formattedName: Utils.formatName(quick_filter_name),
          name: quick_filter_name,
          query: searchCriterias
        })
        await UserPreference.updateOne({ email: emailId, gridId }, {
          $push: {
            advanceSearch: advanceSearchList
          }
        })
        quickFilter = {
          exists: true,
          message: 'Favourite Filter created Successfully!!'
        }
      } else {
        quickFilter = {
          exists: true,
          message: 'You can only save 10 Queries at a time!!'
        }
      }

    }
    return res.status(200).json({ quickFilter });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'failure', response: err });
  }
}

const getFavouriteFilter = async (req, res) => {
  try {
    const { gridId, userId } = req.params;
    const favouriteFilterList = await UserPreference.findOne({ gridId, email: userId }, { advanceSearch: 1 });
    if (favouriteFilterList) {
      res.status(200).json({ message: 'success', response: favouriteFilterList.advanceSearch });
    } else {
      res.status(200).json({ message: 'success' });
    }
  } catch (error) {
    res.status(500).json({ message: 'failure', response: error });
  }
}

const removeFavouriteFilter = async (req, res) => {
  logger.info({ method: "removeFavouriteFilter" }, "Request body : ", req.body);
  try {
    const { queryName, emailId, gridId } = req.body
    await UserPreference.update({ gridId, email: emailId }, {
      $pull: {
        advanceSearch: { formattedName: queryName },
      }
    })
    logger.info({ method: "removeFavouriteFilter" }, `message: Favourite Filter removed successfully`);
    res.status(200).json({ message: 'success' });
  } catch (err) {
    logger.error({ method: "removeFavouriteFilter" },`Error in removing Favourite Filter : ${err.message}`);
    res.status(500).json({ message: 'failure', response: err })
  }
}

const deleteById = async (req, res) => {
  let { id, model, } = req.body;

  try {
    const ModelName = mongoose.models[model];
    const removedCount = await ModelName.remove({ _id: id });
    res.json(removedCount)
  } catch (error) {
    throw new Error(error || "Error in Removing data");
  }
}


module.exports = {
  listData,
  deleteById,
  downloadData,
  getColUniqueValues,
  uploadCsvFile,
  readCsvFile,
  processCsvFile,
  storeCsvFile,
  uploadData,
  importData,
  criteriaBuilder,
  gridFormField,
  getModelList,
  getColumnList,
  getPgModelList,
  getPgColumnList,
  getPgModelAssociations,
  getPgModelAssociatedColumns,
  getSQLModelList,
  getSQLColumnList,
  getSQLModelAssociations,
  getSQLModelAssociatedColumns,
  saveUserPreferences,
  getFavouriteFilter,
  removeFavouriteFilter,
  getGridViews
}
