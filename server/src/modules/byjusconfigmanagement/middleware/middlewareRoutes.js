const express = require('express');
const paymentRoutes = require('./payment/paymentRoutes');


module.exports = () =>
    express.Router()
        .use(paymentRoutes())
