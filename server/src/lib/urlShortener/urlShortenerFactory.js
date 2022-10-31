const config = require('../../config');
const bitly = require('./bitly');
const firebase = require('./firebase');

const getUrlShortener = () => {
    let { activeProvider = "" } = config.urlShortener || {};
    activeProvider = activeProvider.toLowerCase();

    if (activeProvider === "bitly") {
        return bitly;
    } else if (activeProvider === "firebase") {
        return firebase;
    } else {
        throw new Error("Unknown URL shortener provider");
    }

}

module.exports = {
    getUrlShortener
}