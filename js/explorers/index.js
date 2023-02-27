const expTypes = {
  insight: require("./insight"),
  blockbook: require("./blockbook")
};

function getByType(type, url, explorer, proxy) {
  return new expTypes[type](url, explorer, proxy);
}
module.exports = {
  getByType
};
