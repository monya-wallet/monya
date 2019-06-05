/*
 MIT License

 Copyright (c) 2018 monya-wallet zenypota

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/
const KEY_NAME = "data"
const errors=require("./errors")
const crypto = require("crypto")

let password=""

// this crypto algo can be changed
exports.encryptData=(plain,p)=>{
  const cipher = crypto.createCipher('aes256', p);
  return cipher.update(plain, 'utf8', 'base64')+cipher.final('base64');
}
exports.decryptData=(cipher,p)=>{
  try{
  const decipher = crypto.createDecipher('aes256', p);
    return decipher.update(cipher, 'base64', 'utf8')+decipher.final('utf8');
  }catch(e){
    throw new errors.PasswordFailureError()
  }
}

exports.get=(key)=>exports.getAll().then(res=>{
  if(res&&res[key]){
    return res[key]
  }else{
    return null
  }
})

exports.hasData = ()=>new Promise((resolve, reject) => {
  resolve(!!localStorage.getItem(KEY_NAME))
});
exports.dataState = ()=>new Promise((resolve, reject) => {
  const stored= localStorage.getItem(KEY_NAME)
  if(stored){
    try{
      JSON.parse(stored)
    }catch(e){
      return resolve(2)//encrypted
    }
    return resolve(1)//plain
  }
  return resolve(0)//no data
});


exports.set=(key,value)=>exports.getAll().then(res=>{
  if(!res){
    res={}
  }
  res[key]=value
  return exports.setAll(res)
})
exports.getAll = () => new Promise((resolve, reject) => {
  let stored=localStorage.getItem(KEY_NAME)
  if(password){
    stored=exports.decryptData(stored,password) 
  }
  const data= JSON.parse(stored||"null")
  if(data){
    resolve(data)
  }else{
    resolve(null)
  }
});

exports.setAll = (obj) => new Promise((resolve, reject) => {
  if(!obj){
    throw new Error("parameter is empty")
  }
  let dataToStore=JSON.stringify(obj)
  if(password){
    dataToStore=exports.encryptData(dataToStore,password)
  }
  localStorage.setItem(KEY_NAME,dataToStore)
  resolve()
});

exports.erase = () => new Promise((resolve, reject) => {
  localStorage.setItem(KEY_NAME,"")
  password=null
  resolve()
});

exports.setEncryption =(pw)=> exports.getAll().then(res=>{
  if(!res){
    res={}
  }
  
  password=pw
  return exports.setAll(res)
})

exports.setPassword = pw=>new Promise((resolve, reject) => {
  let stored=localStorage.getItem(KEY_NAME)
  if(stored){
    exports.decryptData(stored,pw) 
  }
  password=pw
  resolve()
});

exports.setBiometricPassword= (credential)=> new Promise((resolve, reject) => {
  if (window.plugins) {
    window.plugins.touchid.save("password", credential, (p)=> {
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
    window.plugins.touchid.verify("password", "Password", p=>{
      resolve(p)
    },m=>{
      reject(new errors.BiometricVerificationError(m))
    });
  }else{
    throw new errors.BiometricError("Biometrics is not supported on your device.")
  }
});
exports.setLang = (lang)=>{
  localStorage.setItem("lang",lang)
}
exports.changeLang = (lang)=>{
  if(localStorage.getItem("lang")!==lang){
    localStorage.setItem("lang",lang)
    location.reload()
  }
}
exports.getLang=()=>new Promise((resolve, reject) => {
  resolve(localStorage.getItem("lang"))
});
