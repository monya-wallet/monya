const KEY_NAME = "data"
const errors=require("./errors")
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

exports.setBiometricPassword= (credential)=> new Promise((resolve, reject) => {
  if (window.plugins) {
    window.plugins.touchid.save("password", credential, (password)=> {
      resolve(true)
    },m=>{
      reject(new errors.BiometricError("Failed to set."))
    });
  }else{
    throw new errors.BiometricError("Biometrics is not supported on your device.")
  }
});
exports.isBiometricAvailable= ()=> new Promise((resolve, reject) => {
  if (window.plugins) {
    window.plugins.touchid.isAvailable(()=> {
      resolve(true)
    }, function(msg) {
      resolve(false)
    });
  }else{
    resolve(false)
  }
});
exports.verifyBiometric= ()=> new Promise((resolve, reject) => {
  if (window.plugins) {
    window.plugins.touchid.verify("password", "Password", password=>{
      resolve(password)
    },m=>{
      reject(new errors.BiometricVerificationError(m))
    });
  }else{
    throw new errors.BiometricError("Biometrics is not supported on your device.")
  }
});
exports.changeLang = (lang)=>{
  if(localStorage.getItem("lang")!==lang){
    localStorage.setItem("lang",lang)
    location.reload()
  }
}
exports.getLang=()=>new Promise((resolve, reject) => {
  resolve(localStorage.getItem("lang"))
});
