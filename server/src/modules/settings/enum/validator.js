const Joi = require('joi');

const createEnum = (req, res, next) => {
    const enums = Joi.object().keys({
        label: Joi.string().required(),
        value: Joi.string().required(),
        hidden: Joi.boolean(),
        disabled: Joi.boolean(),
        onlyAdmin: Joi.boolean(),
        _id: Joi.string()
    });

    const schema = Joi.object({
        enumId: Joi.string().required(),
        app: Joi.string().required(),
        module: Joi.string().required(),
        app: Joi.string().required(),
        description: Joi.string().required(),
        enums: Joi.array().items(enums),
        _id: Joi.string(),
        status: Joi.string(),
        createdAt: Joi.string(),
        createdBy: Joi.string(),
        updatedAt: Joi.string(),
        updatedBy: Joi.string(),
        __v: Joi.number()
    });

    const validate = Joi.validate(req.body, schema);

    if (validate.error) {
        const { details = [] } = validate.error || {};
        const errMsg = details.map(e => e.message);
        return res.status(400).json({
            message: `Payload validation failed : ${errMsg.join()}`,
            error: validate.error
        });
    }

    next();
}


module.exports = {
    createEnum
}