const config = require('../../config');
const request = require('request-promise');

const shortenUrl = async (lognUrl) => {
    const { baseShortenUrl, accessToken } = config.urlShortener.bitly || {};
    const options = {
        url: `${baseShortenUrl}?access_token=${accessToken}&longUrl=${lognUrl}`,
        method: 'GET',
        json: true,
    };
    const response = await request(options) || {};
    const { data = {} } = response;
    return {
        shortUrl: data.url,
        actualResponse: response
    }
}

module.exports = {
    shortenUrl
}