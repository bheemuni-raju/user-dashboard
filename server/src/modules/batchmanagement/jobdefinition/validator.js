const Joi = require("joi");

const createJobDefinition = (req, res, next) => {
  const environment = Joi.object().keys({
    name: Joi.string().required(),
    value: Joi.string().required(),
  });

  const schema = Joi.object({
    jobDefinitionName: Joi.string().required(),
    image: Joi.string().required(),
    environment: Joi.array().items(environment),
    memory: Joi.number().min(128).max(2048),
    vcpus: Joi.number().min(1).max(4),
  });

  const validate = Joi.validate(req.body, schema);

  if (validate.error) {
    return res.json({
      message: "Payload validation failed",
      error: validate.error,
    });
  }

  return next();
};

module.exports = {
  createJobDefinition,
};
