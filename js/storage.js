const KEY_NAME = "data"
exports.get = (key) => new Promise((resolve, reject) => {
  const data=JSON.parse(localStorage.getItem(KEY_NAME))
  if(data){
    resolve(data[key])
  }else{
    resolve(null)
  }
});

exports.set = (key,value) => new Promise((resolve, reject) => {
  let data=JSON.parse(localStorage.getItem(KEY_NAME))
  if(!data){
    data={}
  }
  data[key]=value
  localStorage.setItem(KEY_NAME,JSON.stringify(data))
  resolve()
});
