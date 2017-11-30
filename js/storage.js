exports.get = (key) => new Promise((resolve, reject) => {
  resolve(localStorage.getItem(key))
});

exports.set = (key,value) => new Promise((resolve, reject) => {
  resolve(localStorage.setItem(key,value))
});
