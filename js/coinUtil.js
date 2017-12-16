const currencyList = require("./currencyList.js")
const bcLib = require('bitcoinjs-lib')
const bip39 = require("bip39")
const crypto = require('crypto');
const storage = require("./storage")
const errors=require("./errors")


exports.DEFAULT_LABEL_NAME = "Default"

exports.isValidAddress=(addr)=>{
  try{
    bcLib.address.fromBase58Check(addr)
    return true
  }catch(e){
    return false
  }
};
exports.getPrice=(cryptoId,fiatId)=>{
  let currencyPath = []
  let prevId =cryptoId;
  while(prevId!==fiatId){
    currencyPath.push(currencyList.get(prevId).getPrice())
    prevId=currencyList.get(prevId).price.fiat
  }
  return Promise.all(currencyPath).then(v=>{
    let price=1
    v.forEach(p=>{
      price*=p
    })
    return price
  })
}
exports.encrypt=(plain,password)=>{
  const cipher = crypto.createCipher('aes256', password);
  return cipher.update(plain, 'utf8', 'hex')+cipher.final('hex');
}
exports.decrypt=(cipher,password)=>{
  const decipher = crypto.createDecipher('aes256', password);
  return decipher.update(cipher, 'hex', 'utf8')+decipher.final('utf8');
}

exports.makePairsAndEncrypt=(option)=>new Promise((resolve, reject) => {
  let seed;
  let entropy;
  if(option.entropy){
    entropy=option.entropy
    seed=bip39.mnemonicToSeed(bip39.entropyToMnemonic(option.entropy))
  }else if(option.mnemonic){
    entropy=bip39.mnemonicToEntropy(option.mnemonic)
    seed=bip39.mnemonicToSeed(option.mnemonic)
  }else {
    throw new Error("Can't generate entropy")
  }
  if(option.encryptPub){
    resolve({entropy:exports.encrypt(entropy, option.password)})
  }else{
    const ret ={
      entropy:"",
      pubs:{}
    }
    for(let i=0;i<option.makeCur.length;i++){
      let coinId = option.makeCur[i]
      let pub =currencyList[coinId].seedToPubB58(seed)
      ret.pubs[coinId]=pub
    }
    
    ret.entropy=exports.encrypt(entropy, option.password);
    resolve(ret)

  }
});


exports.decryptKeys=(option)=>new Promise((resolve, reject) => {
  let seed=
      bip39.mnemonicToSeed(
        bip39.entropyToMnemonic(
          exports.decrypt(option.entropyCipher,option.password)
        )
      )
  
  const ret = {}
  for(let i=0;i<option.makeCur.length;i++){
    let coinId = option.makeCur[i]
    const pub=currencyList.get(coinId).seedToPubB58(seed)
    ret[coinId]=pub
  }
});

exports.createLabel=(cId,name)=>storage.get("labels").then(res=>{
  if(!res){
    res={}
  }
  if(!res[cId]){
    res[cId]=[exports.DEFAULT_LABEL_NAME]
  }
  if(res[cId].indexOf(name)<=0){
    res[cId].push()
  }
  return storage.set("labels",res)
})


exports.updateLabel=(cId,name,newName)=>storage.get("labels").then(res=>{
  if(!res||!res[cId]){
    throw new Error("Label object for this currency is not created yet.");
  }
  const index=res[cId].indexOf(name)
  if(index>=0){
    res[cId][index]=newName
    return storage.set("labels",res)
  }
  throw new errors.LabelNotFoundError()
})

exports.getLabels=(cId)=>storage.get("labels").then(res=>{
  if(res&&res[cId]){
    return res[cId]
  }else{
    return [exports.DEFAULT_LABEL_NAME]
  }
})
