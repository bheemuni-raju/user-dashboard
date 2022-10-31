const { SemanticConfiguration, ApplicationType, Environment, Application } = require('@byjus-orders/npgexemplum');
const { size, isEmpty } = require('lodash');
const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const logger = require('@byjus-orders/byjus-logger').child({ module: 'semanticController'});

const getSemanticConfigurationByDNS = async (req, res) => {
  logger.info({method:"getSemanticConfigurationByDNS", requestObj: req.body}, "getSemanticConfigurationByDNS method initialized");
  const dns = req.params.dns;
  if (!dns) {
    return res.status(400).json({ message: 'DNS is required' });
  }

  try {
    const data = await SemanticConfiguration.findOne({
      where: {
        dns: dns
      },
      include: [
        { model: ApplicationType, as: 'applicationtype', required: true },
        { model: Environment, as: 'environment', required: true },
      ],
    });

    if (!data) return res.json({ message: 'Configuration not found with this dns!' });
    res.status(200).json(data);
  } catch (err) {
    logger.error(err, "Error in fetching data from getSemanticConfigurationByDNS");
    res.status(400).json({ error: err.message });
  }
};

const createSemanticConfiguration = async (req, res) => {
  logger.info({method:"createSemanticConfiguration", requestObj: req.body}, "createSemanticConfiguration method initialized");

  const { app_id, application_type_id, environment_id, repository_path, env_path, dns, createdBy } = req.body;

  if (!app_id || !application_type_id || !environment_id || !repository_path || !env_path || !dns || !createdBy) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const SemanticData = await SemanticConfiguration.create({
      app_id,
      application_type_id,
      environment_id,
      repository_path,
      env_path,
      dns,
      isActive: true,
      createdBy
    });

    if (!SemanticData) return res.send('Failed to create semantic configuration');

    res.status(201).json(SemanticData);
  } catch (err) {
    logger.error(err, "Error in creating Semantic Configuration");
    res.status(400).json({ error: err.message });
  }
};

const updateSemanticConfiguration = async (req, res) => {
  logger.info({method:"updateSemanticConfiguration", requestObj: req.body}, "updateSemanticConfiguration method initialized");

  const { app_id, application_type_id, environment_id, repository_path, env_path, dns, updatedBy } = req.body;
  const id = req.params.id;

  if (!app_id || !application_type_id || !environment_id || !repository_path || !env_path || !dns || !updatedBy) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updateSemanticConfig = await SemanticConfiguration.update(
      {
        app_id,
        application_type_id,
        environment_id,
        repository_path,
        env_path,
        dns,
        updatedBy
      },
      {
        where: { id: id },
      }
    );

    if (!updateSemanticConfig) return res.send('Failed to update semantic configuration');

    res.status(200).json(updateSemanticConfig);
  } catch (err) {
    logger.error(err, "Error while updating semantic configuration");
    res.status(400).json({ error: err.message });
  }
};

const deleteSemanticConfiguration = async (req, res) => {
  logger.info({method:"deleteSemanticConfiguration",requestObj: req.body}, "deleteSemanticConfiguration method initialized");
  const { id, isActive } = req.body;

  if (!id) return res.status(400).json({ message: 'id is required' });

  try {
    const deleteSemanticConfig = await SemanticConfiguration.update({ isActive }, { where: { id: id } });

    if (!deleteSemanticConfig) return res.status(404).send('Record not exists with this id.');

    res.json(deleteSemanticConfig);
  } catch (err) {
    logger.error(err, "Error while deleting semantic configuration");
    res.status(400).json({ error: err.message });
  }
};

const SemanticConfigurations = async (req, res) => {
  logger.info({method:"SemanticConfigurations",requestObj: req.body}, "SemanticConfigurations method initialized");

  try {
    const {
      page,
      limit,
      sort,
      searchCriterias = [],
      contextCriterias = [],
    } = req.body;

    let { filter = {} } = req.body;
    filter =
      size(filter) === 0
        ? sqlCriteriaBuilder(
            searchCriterias,
            contextCriterias,
            sort,
            false,
            "SemanticConfiguration"
          )
        : filter;
    const sqlOrder = Object.keys(sort).map((item) => [
      ...item.split("."),
      sort[item],
    ]);

    const options = {
      page: page || 1,
      paginate: limit || 10,
      sort,
      order: sqlOrder,
      where: filter.rootQuery,
    };

    const dataList = await SemanticConfiguration.paginate({
      ...options,
      include: [
        ...filter.associationQuery,
        {
          model: ApplicationType,
          as: "applicationtype",
          required: true,
          duplicating: true,
        },
        {
          model: Environment,
          as: "environment",
          required: true,
          duplicating: true,
        },
        {
          model: Application,
          as: "applicationName",
          required: true,
          duplicating: true,
        },
      ],
      raw: true,
    });

    res.sendWithMetaData({
      docs: dataList.docs,
      total: dataList.total,
      pages: dataList.pages,
      limit,
      page,
    });
  } catch (error) {
    logger.error(error, "Error fetching semantic configuration list");
    res.status(400).json({error})
  }
};

module.exports = {
  createSemanticConfiguration,
  getSemanticConfigurationByDNS,
  SemanticConfigurations,
  updateSemanticConfiguration,
  deleteSemanticConfiguration,
};
