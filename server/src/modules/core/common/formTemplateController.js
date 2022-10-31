const { UserFormTemplates } = require('@byjus-orders/nexemplum/ums');
const { get, isEmpty, startCase } = require('lodash');
const bunyan = require('../../../lib/bunyan-logger');
const logger = bunyan('userFormTemplateController');

const getUserFormTemplate = async (req, res) => {
  try {
    logger.info({ method: 'Inside getUserFormTemplate function in UserFormTemplates' });
    const { department } = req.params;

    let userFormTemplate = await UserFormTemplates.findOne({ departmentFormattedName: department }, { formFields: 1 }, { _id: 0 });
    let formFields = get(userFormTemplate, "formFields", []);

    if (!isEmpty(formFields)) {
      res.status(200).json({ status: 'success', formFields });
    }
    else {
      res.status(400).json({ status: 'failure', response: 'userFormTemplate data not found' });
    }
  } catch (error) {
    logger.error({ method: 'getUserFormTemplate', error }, 'Error getting UserFormTemplate');
    res.status(400).json({ status: 'failure', response: 'Unexpected error occured' });
  }
};

const updateUserFormTemplate = async (req, res) => {
  try {
    logger.info({ method: 'Inside updateUserFormTemplate function in UserFormTemplates', });
    let { formFields = {}, formTemplateFormattedName = "", departmentFormattedName = "" } = req.body;

    let userFormTemplate = await UserFormTemplates.findOne(
      {
        formattedName: formTemplateFormattedName,
        departmentFormattedName
      });

    if (!isEmpty(userFormTemplate)) {
      await UserFormTemplates.findOneAndUpdate(
        {
          formattedName: formTemplateFormattedName,
          departmentFormattedName
        },
        {
          $set: {
            formFields,
            updatedBy: get(req, "user.email"),
            updatedAt: new Date()
          }
        });

      res.status(200).json({ status: 'success', response: 'userFormTemplate updated successfully' });
    }
    else {
      res.status(404).json({ status: 'failure', response: 'userFormTemplate not found' });
    }
  } catch (error) {
    console.log(error);
    logger.error({ method: 'updateUserFormTemplate', error }, 'Error updating UserFormTemplate');
    res.status(400).json({ status: 'failure', response: 'Unexpected error occured' });
  }
};

const createUserFormTemplate = async (req, res) => {
  try {
    logger.info({ method: 'Inside createUserFormTemplate function in UserFormTemplates', });
    let { formFields = {}, formTemplateFormattedName = "", departmentFormattedName = "" } = req.body;

    let userFormTemplate = await UserFormTemplates.findOne(
      {
        formattedName: formTemplateFormattedName,
        departmentFormattedName
      });

    if (isEmpty(userFormTemplate)) {
      await UserFormTemplates.insertMany(
        {
          name: startCase(formTemplateFormattedName),
          department: startCase(departmentFormattedName),
          formattedName: formTemplateFormattedName,
          departmentFormattedName,
          formFields,
          createdBy: get(req, "user.email"),
          createdAt: new Date()
        });

      res.status(200).json({ status: 'success', response: 'userFormTemplate created successfully' });
    }
    else {
      res.status(400).json({ status: 'failure', response: 'userFormTemplate already exists' });
    }

  } catch (error) {
    console.log(error);
    logger.error({ method: 'updateUserFormTemplate', error }, 'Error creating UserFormTemplate');
    res.status(400).json({ status: 'failure', response: 'Unexpected error occured' });
  }
};

module.exports = {
  getUserFormTemplate,
  updateUserFormTemplate,
  createUserFormTemplate
};
