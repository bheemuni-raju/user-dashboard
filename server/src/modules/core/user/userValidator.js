const Joi = require('joi');

const updateContactDetails = (req, res, next) => {
    const contactDetailSchema = Joi.object().keys({
        contactNo: Joi.string().required(),
        isVerified: Joi.boolean(),
        isPrimary: Joi.boolean()
    });

    const schema = Joi.object({
        contactNo: (req.body.action != "SAVE_CONTACT_DETAILS") ? Joi.string().required() : Joi.string(),
        action: Joi.string().required(),
        email: (req.user) ? Joi.string() : Joi.string().required(),
        otp: (req.body.action === "SAVE_VERIFY_OTP") ? Joi.string().required() : Joi.string(),
        otpMessage: (req.body.action === "SAVE_SEND_OTP") ? Joi.string().required() : Joi.string(),
        contactDetails: (req.body.action === "SAVE_CONTACT_DETAILS") ? Joi.array().items(contactDetailSchema) : Joi.array()
    });

    const validate = Joi.validate(req.body, schema);

    if (validate.error) {
        return res.status(400).json({
            message: `Payload validation failed :
            ${validate.error.message}`,
            error: validate.error
        });
    }

    next();
}

const updateUserEmail = (req, res, next) => {

    const schema = Joi.object({
        oldEmail: Joi.string().required(),
        newEmail: Joi.string().required(),
        updatedBy: Joi.string().required()
    });

    const validate = Joi.validate(req.body, schema);

    if (validate.error) {
        return res.status(400).json({
            message: `Payload validation failed :
            ${validate.error.message}`,
            error: validate.error
        });
    }

    next();
}

const validateUserFormTemplateSchema = (req, res, next) => {

    const formFieldSchema = Joi.object().keys({
        general: Joi.array().required(),
        department: Joi.array().required()
    });

    const schema = Joi.object({
        formFields: formFieldSchema,
        formTemplateFormattedName: Joi.string().required(),
        departmentFormattedName: Joi.string().required()
    });

    const validate = Joi.validate(req.body, schema);

    if (validate.error) {
        return res.status(400).json({
            message: `Payload validation failed :
            ${validate.error.message}`,
            error: validate.error
        });
    }

    next();
}

module.exports = {
    updateUserEmail,
    updateContactDetails,
    validateUserFormTemplateSchema
}