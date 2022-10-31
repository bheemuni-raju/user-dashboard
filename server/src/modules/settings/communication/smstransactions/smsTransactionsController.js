const { extend } = require('lodash')
const { size, get } = require('lodash');
const { SmsTransaction } = require('@byjus-orders/nexemplum/ums');
const { criteriaBuilder } = require('../../../../common/criteriaBuilder');
const { sendSmsGupshup, sendSmsPlivo, sendSmsKaleyra, sendSmsValueFirst, sendSmsKarix } = require('../smsprovider/smsProviderController');

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

        const list = await SmsTransaction.paginate(filter, options)
        res.sendWithMetaData(list);
    } catch (error) {
        throw new Error(error || "Error in fetching data");
    }
}

const listAll = async (req, res) => {
    const smsTransactions = await SmsTransaction.find();
    res.json(smsTransactions)
}

/**
 * Show the current SMS Transaction
 */
const readData = (req, res) => {
    res.json(req.transaction);
}

const transactionById = async (req, res, next, id) => {
    let appName = get(req, "headers.x-app-origin", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    const transaction = await SmsTransaction.findOne({ transactionId: id, appName, orgFormattedName });
    if (!transaction) throw new NotFoundError
    req.transaction = transaction
    next()
}

const transactionsByTemplateId = async (req, res) => {
    let templateId = get(req, 'params.smsTemplateId', '');
    let appName = get(req, "headers.x-app-origin", "");
    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    const transactions = await SmsTransaction.find({ templateId, appName, orgFormattedName });
    res.json(transactions);
}


/** Send SMS Functionality */
const sendSms = async (req, res) => {
    const { provider } = req.body;
    let smsResponse = await handleSmsNotification(req);

    let orgFormattedName = get(req, 'user.orgFormattedName', '');

    const newSmsTransaction = new SmsTransaction({
        ...req.body,
        status: get(smsResponse, 'status', 'failure'),
        transactionId: get(smsResponse, 'transactionId', ''),
        providers: [provider],
        orgFormattedName,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: get(req, "user.email", "system"),
        updatedBy: get(req, "user.email", "system")
    })

    const savedSmsTransaction = await newSmsTransaction.save()
    res.json({ savedSmsTransaction, smsResponse })
}

/**This is the function used for sending the sms to the customer phone */
const handleSmsNotification = async (req) => {
    try {
        let response = {};
        const { provider } = req.body;
        if (provider === "gupshup") {
            response = await sendSmsGupshup(req);
        }
        else if (provider === 'plivo') {
            response = await sendSmsPlivo(req);
        }
        else if (provider === 'kaleyra') {
            response = await sendSmsKaleyra(req);
        }
        else if (provider === 'value_first') {
            response = await sendSmsValueFirst(req);
        }
        else if (provider === 'karix') {
            response = await sendSmsKarix(req);
        }

        return response;
    }
    catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    listData,
    listAll,
    readData,
    transactionById,
    transactionsByTemplateId,
    sendSms
}