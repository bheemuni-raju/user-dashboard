const getGmtTime = function (date) {
    const offset = date.getTimezoneOffset() * 60000;
    const gmtDate = date.setTime(date.getTime() - offset);

    return new Date(gmtDate)
}

module.exports = {
    getGmtTime
}