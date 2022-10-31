class ValidatorBase {
    isValidEmail(email) {
        if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return false
        }
        return true
    }
    isValidAmount(amount) {
        if (!amount || !/^[0-9]*$/.test(amount)) {
            return false
          }
          return true
    }
    isValidAadharNumber(aadharNumber) {
        if (!aadharNumber || !/^[0-9]*$/.test(aadharNumber) || aadharNumber.length !== 12) {
            return false
          }
          return true
    }
    isValidPincode(pincode) {
        if (!pincode || !/^[a-zA-Z0-9]*$/.test(pincode)) {
            return false
          }
          return true
    }
    isValidMobileNumber(mobileNumber) {
        if (!mobileNumber || !/^[0-9]*$/.test(mobileNumber) || mobileNumber.length < 9) {
            return false
          }
          return true
    }
    isValidAccountNumber(accountnumber) {
        if (!accountnumber || !/^[0-9]*$/.test(accountnumber)) {
            return false
          }
          return true
    }
    isValidIFSCode(ifsCode) {
        if (!ifsCode || !/^[a-zA-Z0-9]*$/.test(ifsCode)) {
            return false
          }
          return true
    }
}

module.exports = ValidatorBase