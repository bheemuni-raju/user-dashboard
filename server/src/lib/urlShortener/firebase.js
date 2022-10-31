const config = require('../../config');
const request = require('request-promise');

const shortenUrl = async (lognUrl) => {
    const { baseShortenUrl, dynamicLinksDomain, accessToken } = config.urlShortener.firebase || {};
    const options = {
        url: `${baseShortenUrl}?key=${accessToken}`,
        method: 'POST',
        json: true,
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            longDynamicLink: `${dynamicLinksDomain}?link=${lognUrl}`,
            suffix: {
                option: "UNGUESSABLE"
            }
        }
    };
    const respose = await request(options) || {};
    return {
        shortUrl: respose.shortLink,
        actualResponse: respose
    }
}

module.exports = {
    shortenUrl
}