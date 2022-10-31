const { extend } = require('lodash')
const { size, get, snakeCase, isEmpty } = require('lodash');
const { SmsProvider } = require('@byjus-orders/nexemplum/ums')
const request = require('request-promise');

const {
    NotFoundError, BadRequestError
} = require('../../../../lib/errors');
const { criteriaBuilder } = require('../../../../common/criteriaBuilder');
const commonController = require("../../../../common/dataController")
const utils = require('../../../../lib/utils')

const GupshupProvider = require('@byjus-orders/tyrion-plugins/sms-partners/gupshup/Gupshup');
const KaleyraProvider = require('@byjus-orders/tyrion-plugins/sms-partners/kaleyra/Kaleyra');
const PlivoProvider = require('@byjus-orders/tyrion-plugins/sms-partners/plivo/Plivo');
const ValueFirstProvider = require('@byjus-orders/tyrion-plugins/sms-partners/valuefirst/ValueFirst');
const KarixProvider = require('@byjus-orders/tyrion-plugins/sms-partners/karix/Karix');

const listData = async (req, res) => {
    let appName = get(req, "headers.x-app-origin", "");
    let { page, limit, model, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, db } = req.body;
    filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
    filter["appName"] = appName;
    filter["orgFormattedName"] = get(req, 'user.orgFormattedName', 'byjus');

    try {
        const options = {
            page: page || 1,
            limit: limit || 10,
            sort,
            populate,
            select
        }

        const list = await SmsProvider.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}


/**
* Create Sms Provider`
*/
const createData = async (req, res) => {
    const { name } = req.body
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    if (!name) throw new BadRequestError("Invalid Request : Required parameters missing")

    const newSmsProvider = new SmsProvider({
        ...req.body,
        formattedName: snakeCase(name),
        orgFormattedName,
        capabilities: [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: get(req, "user.email", "system"),
        updatedBy: get(req, "user.email", "system")
    })

    const savedSmsProvider = await newSmsProvider.save()

    res.json(savedSmsProvider)
}

/**
 * Show the current Sms Provider
 */
const readData = (req, res) => {
    res.json(req.smsProvider)
}

/**
 * List all Sms Providers
 */
const listAll = async (req, res) => {
    const smsProviders = await SmsProvider.find();

    res.json(smsProviders)
}

/**
 * Update an Sms Provider
 */
const updateData = async (req, res) => {
    const smsProvider = extend(req.smsProvider, req.body)
    const savedSmsProvider = await smsProvider.save()
    res.json(savedSmsProvider)
}

/** Delete an Sms Provider*/
const deleteData = async (req, res) => {
    const id = req.smsProvider._id

    await SmsProvider.findByIdAndRemove(id)

    res.json(req.smsProvider)
}

const smsProviderById = async (req, res, next, id) => {
    const smsProvider = await SmsProvider.findById(id)

    if (!smsProvider) throw new NotFoundError

    req.smsProvider = smsProvider
    next()
}

const sendSmsGupshup = async (req, res) => {
    let result = {};
    let { phone, content } = req.body;
    let smsDetails = {
        gupshupUrl: process.env.SMS_GUPSHUP_URI,
        phone,
        content,
        gupshupUserId: process.env.SMS_GUPSHUP_USER_ID,
        gupshupPassword: process.env.SMS_GUPSHUP_PASSWORD
    }

    result = {
        status: 'failure',
        transactionId: '',
        error: ''
    }

    const response = await GupshupProvider.sendSms(smsDetails) || {};
    let responseArray = response.split('|');
    if (responseArray[0].trim() === "success") {
        result = {
            status: 'success',
            transactionId: responseArray[2].trim(),
            error: ''
        }
    }
    else {
        result["error"] = responseArray[2].trim();
    }

    return result;
}

const sendSmsPlivo = async (req, res) => {
    let { phone, content } = req.body;

    let smsDetails = {
        plivoAccountId: process.env.SMS_PLIVO_ACC_ID,
        plivoAuthToken: process.env.SMS_PLIVO_AUTH_TOKEN,
        content,
        plivoNumber: process.env.SMS_PLIVO_NUMBER,
        phone
    }

    let result = await PlivoProvider.sendSms(smsDetails);
    return result;
}

const sendSmsKaleyra = async (req, res) => {
    let result = {};
    let { phone, content, senderId } = req.body;

    try {

        let smsDetails = {
            kaleyraUri: process.env.SMS_KALEYRA_URI,
            kaleyraApiKey: process.env.SMS_KALEYRA_API_KEY,
            content,
            phone,
            senderId
        }

        result = {
            status: 'failure',
            transactionId: '',
            error: ''
        }

        const response = await KaleyraProvider.sendSms(smsDetails);
        if (get(response, 'status', '') === 'OK') {
            result = {
                status: 'success',
                transactionId: get(response, 'data.0.id', ''),
                error: ''
            }
        }
        else {
            result = {
                status: 'failure',
                transactionId: '',
                error: get(response, 'message', '')
            }
        }
    }
    catch (ex) {
        console.log("KALYERA ERROR", ex);
    }

    return result;
}

const sendSmsValueFirst = async (req, res) => {
    let result = {};
    let { phone, content, senderId } = req.body;

    try {

        let smsDetails = {
            valueFirstUrl: process.env.SMS_VALUE_FIRST_URI,
            content,
            phone,
            senderId,
            valueFirstTokenUrl: process.env.SMS_VALUE_FIRST_TOKEN_URI,
            tokenAuthHeaderValue: process.env.SMS_VALUE_FIRST_TOKEN_AUTH_HEADER_VALUE
        }

        result = {
            status: 'failure',
            transactionId: '',
            error: ''
        }

        const response = await ValueFirstProvider.sendSms(smsDetails);
        if (!isEmpty(get(response, 'MESSAGEACK.GUID.GUID', ''))) {
            result = {
                status: 'success',
                transactionId: get(response, 'MESSAGEACK.GUID.GUID', ''),
                error: ''
            }
        }
        else {
            result = {
                status: 'failure',
                transactionId: '',
                error: get(response, 'ERROR.CODE', '')
            }
        }
    }
    catch (ex) {
        console.log("VALUE FIRST ERROR", ex);
    }

    return result;
}

const sendSmsKarix = async (req, res) => {
    let result = {};
    let { phone, content, senderId } = req.body;

    try {

        let smsDetails = {
            karixUrl: process.env.SMS_KARIX_URI,
            karixApiKey: process.env.SMS_KARIX_API_KEY,
            content,
            phone,
            senderId
        }

        result = {
            status: 'failure',
            transactionId: '',
            error: ''
        }

        const response = await KarixProvider.sendSms(smsDetails);
        if (get(response, 'status.code', '') === '200') {
            result = {
                status: 'success',
                transactionId: get(response, 'ackid', ''),
                error: ''
            }
        }
        else {
            result = {
                status: 'failure',
                transactionId: '',
                error: get(response, 'status.desc', '')
            }
        }
    }
    catch (ex) {
        console.log("KARIX ERROR", ex);
    }

    return result;
}

module.exports = {
    ...commonController,
    listData,
    createData,
    readData,
    listAll,
    updateData,
    deleteData,
    smsProviderById,
    sendSmsGupshup,
    sendSmsPlivo,
    sendSmsKaleyra,
    sendSmsValueFirst,
    sendSmsKarix
}