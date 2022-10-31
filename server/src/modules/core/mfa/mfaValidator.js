const Joi = require('joi');

const otpSchema = Joi.object().keys({
    email: Joi.string().required(),
    token: Joi.string().max(6).required(),
    mfaSessionToken: Joi.string().required()
});

function requestValidator(schema) {
    return (req, res, next) => {
        const validate = Joi.validate(req.body, schema);

        if (validate.error) {
            return res.status(400).json({
                message: `Payload validation failed :
                ${validate.error.message}`,
                error: validate.error
            });
        }
        else next()
    }
}

module.exports = {
    otpSchema,
    requestValidator
}