const ValidatorBase = require('./validatorBase')
const { Employee } = require('@byjus-orders/nexemplum/ums');

class PaymentReferenceValidator extends ValidatorBase {
  async createPaymentReference(req) {
    let { method, referenceId, amount, salesEmail } = req.body
    let validationError = {}
    if (!method) {
      validationError.method = 'Method is required'
    }
    if (!referenceId) {
      validationError.referenceId = 'Reference ID is required'
    }
    if (!this.isValidAmount(amount)) {
      validationError.amount = 'Enter Amount only Integer format'
    }
    if (!salesEmail) {
      validationError.salesEmail = 'Sales email is required'
    } else {
      const doc = await Employee.findOne({ email: salesEmail }).select("email")
      if (!doc) {
        validationError.salesEmail = 'Invalid Sales Email'
      }
    }
    return validationError
  }
}

module.exports = PaymentReferenceValidator