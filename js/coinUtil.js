const currencyList = require("./currencyList.js")
const bcLib = require('bitcoinjs-lib')
const bip39 = require("bip39")
const crypto = require('crypto');
const storage = require("./storage")
const errors=require("./errors")


exports.DEFAULT_LABEL_NAME = "Default"
exports.GAP_LIMIT=20
exports.GAP_LIMIT_FOR_CHANGE=20

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
  let prevId =cryptoId;//reverse seek is not implemented
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
      let pub =currencyList.get(coinId).seedToPubB58(seed)
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
  
exports.copy=data=>{
  const temp = document.createElement('div');

  temp.textContent = data;

  const s = temp.style;
  s.position = 'fixed';
  s.left = '-100%';
  s.userSelect="text"

  document.body.appendChild(temp);
  document.getSelection().selectAllChildren(temp);

  const result = document.execCommand('copy');

  document.body.removeChild(temp);
  // true なら実行できている falseなら失敗か対応していないか
  return result;
}

exports.getBip21=(bip21Urn,address,query)=>{
  let queryStr="?"
  for(let v in query){
    if(query[v]){
      queryStr+=encodeURIComponent(v)+"="+encodeURIComponent(query[v])+"&"
    }
  }
  return bip21Urn+":"+address+queryStr
};

exports.parseUrl=url=>new Promise((resolve,reject)=>{
  const ret = {
    url,
    raw:null,
    protocol:"",
    isCoinAddress:false,
    isPrefixOk:false,
    isValidAddress:false,
    coinId:"",
    address:"",
    message:"",
    amount:0,
    opReturn:"",
    label:"",
    isValidUrl:false
  }
  let raw;
  try{
    raw=new URL(url)
  }catch(e){
    return resolve(ret)
  }
  ret.raw=raw
  ret.protocol=raw.protocol.slice(0,-1),
  ret.isValidUrl=true
  currencyList.each(v=>{
    if(v.bip21===ret.protocol){
      ret.isCoinAddress=true
      ret.coinId=v.coinId
      ret.address=raw.pathname
      for(let i=v.prefixes.length-1;i>=0;i--){
        if(v.prefixes[i]===ret.address[0]){
          ret.isPrefixOk=true
          break
        }
      }
      ret.isValidAddress=exports.isValidAddress(ret.address)
      ret.message=raw.searchParams.get("message")
      ret.label=raw.searchParams.get("label")
      ret.amount=raw.searchParams.get("amount")
      ret.opReturn=raw.searchParams.get("req-opreturn")
    }
  })
  
  resolve(ret)
})

exports.proxyUrl=url=>{
  if(window.cordova){
    return url
  }else{
    return 'https://zaif-status.herokuapp.com/proxy/?u='+encodeURIComponent(url)
  }
}
exports.shortWait=()=>new Promise(r=>{
  setTimeout(r,150)
})
exports._url=""
exports._urlCb=()=>{}
exports.queueUrl=url=>{
  exports._url=url
  exports._urlCb(url)
}
exports.getQueuedUrl=()=>{
  return exports._url
}
exports.popQueuedUrl=()=>{
  const url = exports._url
  exports._url=""
  return url
}
exports.setUrlCallback=cb=>{
  if (typeof(cb)==="function") {
    exports._urlCb=cb
  }
}
exports.hasInitialized=false

exports.buildBuilderfromPubKeyTx=(transaction,network)=>{
  let txb = new bcLib.TransactionBuilder(network)
  txb.setVersion(transaction.version)
  txb.setLockTime(transaction.locktime)
  transaction.ins.forEach(function (txIn) {
    txb.addInput(txIn.hash, txIn.index)
  })
  transaction.outs.forEach(function (txOut) {
    txb.addOutput(txOut.script, txOut.value)
  })
  return txb
}
