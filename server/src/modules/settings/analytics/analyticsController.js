const { size } = require('lodash');
const { AppUser, AppRole } = require('@byjus-orders/nexemplum/ums');

const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const commonController = require("../../../common/dataController");

const logger = require('@byjus-orders/byjus-logger').child({ module: 'analyticsController'});

const listUser = async (req, res) => {
    logger.info({method:"listUser", requestObj: req.body}, "listUser method initialized");

    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await AppUser.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        logger.error(error, "Error while fetching listUser data");
        throw new Error(error || "Error in fetching data");
    }
}

const listRole = async (req, res) => {
    logger.info({method:"listRole", requestObj: req.body}, "listRole method initialized");

    let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await AppRole.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        logger.error(error, "Error while fetching listRole data");
    }
}

/**
 * List all App Users
 */
const listAllUsers = async (req, res) => {
    logger.info({method:"listAllUsers", requestObj: req.body}, "listAllUsers method initialized");
    try {
        const appUsers = await AppUser.find({ status: "active" });
        res.send(appUsers);
    } catch (error) {
        logger.error(error, "Error while fetching listRole data");
    }
}

/**
 * List all App Roles
 */
const listAllRoles = async (req, res) => {
    logger.info({method:"listAllRoles", requestObj: req.body}, "listAllRoles method initialized");
    try{
        const appRoles = await AppRole.find();
        res.json(appRoles)
    }
    catch(error){
        logger.error(error, "Error while fetching listAllRoles data");
    }
}

module.exports = {
    ...commonController,
    listUser,
    listRole,
    listAllRoles,
    listAllUsers
}