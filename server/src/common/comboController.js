const mongoose = require('mongoose');

const listComboData = async (req, res) => {
    const { model, filter, displayKey, valueKey,
        page, limit, sort, populate } = req.body

    /**Initially load only 50 records */
    const options = {
        page: page || 1,
        limit: limit || 50,
        sort: sort || { [displayKey]: 1 },
        populate: populate || "",
        select: valueKey ? [displayKey, valueKey] : ''
    }

    const ModelName = mongoose.models[model]
    try {
        const list = await ModelName.paginate(filter, options)
        res.json(list.docs)
    } catch (error) {
        throw new Error(error)
    }

}

module.exports = {
    listComboData
}
