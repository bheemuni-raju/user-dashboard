/**Function to generate Grid Id from model Name */
const generateGridId = (modelName) => {
    if (!modelName) throw new Error("Model Name is missing");

    const gridId = `RETRIEVE_${modelName.toUpperCase()}`;
    return gridId;
}

module.exports = {
    generateGridId
}