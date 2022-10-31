const mongoose = require('mongoose');
const { get, extend, remove, flattenDeep, cloneDeep, map } = require('lodash');
const { GridTemplate } = require('@byjus-orders/nexemplum/oms');

const commonController = require('../../../common/dataController');
const logger = require('../../../lib/bunyan-logger')("gridTemplateController");
const utils = require('./utils/gridTemplateUtils');

const createGridTemplate = async (req, res) => {
    const { templateData } = req.body;
    const { viewName, viewFormattedName, gridId } = templateData;

    if (!viewName || !viewFormattedName || !gridId) throw new Error("View name and Grid Id is mandatory");
    if (get(templateData, 'viewName', '').length > 21) throw new Error("viewName should be atmost 21 characters long");

    try {
        //const gridId = utils.generateGridId(model);
        const gridTemplate = new GridTemplate({
            gridId,
            ...templateData
        });

        const savedGridTemplate = await gridTemplate.save();
        res.json(savedGridTemplate);
    } catch (error) {
        throw new Error(error);
    }
}

const readGridTemplate = async (req, res) => {
    const { gridId, viewName } = req.query;

    if (!gridId || !viewName) throw new Error("GridId and View Name is mandatory");
    let query = {};
    if (gridId && gridId !== "null") {
        query["gridId"] = gridId;
    }
    if (viewName && viewName !== "undefined") {
        query["viewFormattedName"] = viewName;
    }

    try {
        const gridTemplate = await GridTemplate.findOne(query);
        res.json(gridTemplate);
    } catch (error) {
        throw new Error(error);
    }
}

const updateGridTemplate = async (req, res) => {
    const { templateData, gridId, viewName } = req.body;

    if (!gridId || !templateData) throw new Error("GridId and Template Data is mandatory");
    if (get(templateData, 'viewName', '').length > 21) throw new Error("viewName should be atmost 21 characters long");
    let query = {
        gridId
    };
    if (viewName) {
        query["viewFormattedName"] = viewName;
    }

    try {
        const savedGridTemplate = await GridTemplate.findOneAndUpdate(query, {
            $set: {
                ...templateData
            }
        });

        res.json(savedGridTemplate);
    } catch (error) {
        throw new Error(error);
    }
}

const deleteGridTemplate = async (req, res) => {
    const id = req.gridTemplate._id;

    await GridTemplate.findByIdAndRemove(id);

    res.json(req.gridTemplate);
}

const getDbCollections = async (req, res) => {
    const { database } = req.body;

    if (!database) throw new Error("database is missing");

    try {
        const dbData = mongoose[database];
        if (dbData) {
            const collectionArray = dbData.modelNames() || [];

            res.json(collectionArray);
        }
        else {
            throw new Error(`Database ${database} doesn't exist`);
        }
    } catch (error) {
        throw new Error(`Error in fetching details of Database ${database} - ${error}`);
    }
}

const getModelColumns = async (req, res) => {
    const { model, database } = req.body;

    if (!model) throw new Error('Model is missing');

    try {
        const mongooseModel = (database && mongoose[database]) ? mongoose[database].model(model) : mongoose.model(model);

        const { schema, db } = mongooseModel || {};
        const dbName = get(db, 'db.databaseName', '');
        const modelSchema = schema ? schema : null;
        const modelPaths = modelSchema ? modelSchema.paths : {};

        const columnsKeyArray = Object.keys(modelPaths);

        /**Get clone of model paths to avoid overriding of model configurations*/
        const clonedModelPaths = cloneDeep(modelPaths);

        /**Get column array configuration */
        let columnMap = getColumnConfigurationMap(columnsKeyArray, clonedModelPaths);

        /**Merge all the column configurations */
        columnMap = flattenDeep(columnMap);

        /**Remove null/undefined values */
        remove(columnMap, (n) => { return !n });

        logger.info(columnMap);
        res.json({
            model,
            dbName,
            columns: columnMap,
            total: columnMap.length
        });

    } catch (error) {
        throw new Error(`Error occured while fetching model Columns: ${error}`);
    }
}

const getColumnConfigurationMap = (columnsKeyArray, modelPaths) => {
    const columnMap = columnsKeyArray.map((columnKey) => {
        const columnConfig = modelPaths[columnKey] || {};
        const { path, instance } = columnConfig;

        /**If type==Array, then get all the columns defined inside array */
        if (instance === "Array") {
            const { schema } = columnConfig || {};
            const { paths } = schema || {};
            const columnKeys = paths ? Object.keys(paths) : [];

            if (columnKeys.length) {
                const ArrayTypeColumnMap = columnKeys.map((col) => {
                    let colConfig = paths[col] || {};
                    //const { path, instance } = colConfig;

                    colConfig.path = `${path}.${colConfig.path}`;
                    const formattedColConfig = generateColumnConfiguration(col, colConfig);

                    return formattedColConfig;
                });
                logger.info(ArrayTypeColumnMap);
                return ArrayTypeColumnMap;
            }
            else {
                const formattedConfig = generateColumnConfiguration(columnKey, columnConfig);
                return formattedConfig;
            }
        }
        /**Else get the column configuration */
        else {
            const formattedConfig = generateColumnConfiguration(columnKey, columnConfig);
            return formattedConfig;
        }
    });

    return columnMap;
}

const generateColumnConfiguration = (key, config) => {
    const { path, instance } = config;

    /**Mapping for all data types */
    const typeMap = {
        String: "string",
        Number: "number",
        Boolean: "boolean",
        Date: "date",
        ObjectID: "objectId",
        Mixed: "object",
        Array: "array"
    }

    /**Don't include object Id and version key columns */
    if (instance === "ObjectID" || path === "__v") {
        return null;
    }
    /**Create the default column configuration to be sent */
    else {
        const configuration = {
            "datafield": path,
            "type": typeMap[instance] || "",
            "text": "",
            "visibility": false,
            "hidden": path == "__v" ? true : false,
            "searchable": false,
            "sortable": false,
            "exportable": false,
            "formatter": ""
        }
        return configuration;
    }
}

const gridTemplateByGridId = async (req, res, next, gridId) => {
    if (!gridId) throw new Error(`Grid Id-${gridId} is missing!`);

    const gridTemplate = await GridTemplate.findOne({ gridId });

    if (!gridTemplate) throw new Error("Not Found");

    req.gridTemplate = gridTemplate;
    next();
}

module.exports = {
    ...commonController,
    createGridTemplate,
    readGridTemplate,
    updateGridTemplate,
    deleteGridTemplate,
    getDbCollections,
    getModelColumns,
    gridTemplateByGridId
}