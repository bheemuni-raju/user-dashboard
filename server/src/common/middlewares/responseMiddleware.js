const { getGridViews } = require('../dataController');

const assignResponseMiddleware = (req, res, next) => {
    const sendWithMetaData = async (apiResponse) => {
        const gridConfig = await getGridViews(req);
        res.json({
            ...apiResponse,
            gridConfig
        });
    }

    const writeWithMetaData = async (apiResponse) => {
        const gridConfig = await getGridViews(req);
        res.write(JSON.stringify({
            ...apiResponse,
            gridConfig
        }));
        res.end();
    }

    res.sendWithMetaData = sendWithMetaData;
    res.writeWithMetaData = writeWithMetaData;
    next();
}

module.exports = assignResponseMiddleware;