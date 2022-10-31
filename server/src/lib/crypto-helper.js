var CryptoJS = require("crypto-js");

function CrytoManager(iv) {
    this.iv = iv;
}

CrytoManager.prototype.encrypt = function (string, key) {
    if (!string) throw new Error('please provide a valid string')
    try {
        const ciphertext = CryptoJS.AES.encrypt(string, key,this.iv).toString();
        return ciphertext;
    }
    catch (err) {
        throw new Error(`encountered error in encryption ${err.message}`);
    }
}


CrytoManager.prototype.decrypt = function (string, key) {
    if (!string) throw new Error('please provide a valid string')
    try {
        const bytes  = CryptoJS.AES.decrypt(string, key,this.iv);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedData;
    }
    catch (err) {
        throw new Error(`encountered error in decryption ${err.message}`);
    }
}

module.exports = CrytoManager;