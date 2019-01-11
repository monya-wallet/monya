const expTypes = {
    insight: require('./insight'),
    blockbook: undefined,
}

function getByType(type, url, explorer) {
    return new(expTypes[type])(url, explorer);
}
module.exports = {
    getByType
};