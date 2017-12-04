exports.get = (key) => new Promise((resolve, reject) => {
  setInterval(()=>{
    resolve(localStorage.getItem(key))
  },500)
});

exports.set = (key,value) => new Promise((resolve, reject) => {
  setInterval(()=>{
    resolve(localStorage.setItem(key,value))
  },390)
});
