const currencyList = require("./currencyList.js")
const bcLib = require('bitcoinjs-lib')
const zecLib = require("@missmonacoin/bitcoinjs-lib-zcash")
const bip39 = require("bip39")
const crypto = require('crypto');
const storage = require("./storage")
const errors=require("./errors")
const axios=require("axios")

exports.DEFAULT_LABEL_NAME = "Default"
exports.GAP_LIMIT=20
exports.GAP_LIMIT_FOR_CHANGE=20

exports.isValidAddress=(addr)=>{
  try{
    bcLib.address.fromBase58Check(addr)
    return true
  }catch(e){
    try {
      zecLib.address.fromBase58Check(addr)
      return true
    } catch (e2) {
      return false
    }
  }
};
exports.getAddrVersion=(addr)=>{
  try{
    return bcLib.address.fromBase58Check(addr).version
  }catch(e){
    try {
      return zecLib.address.fromBase58Check(addr).version
    } catch (e2) {
      return null
    }
  }
};
exports.usdPrice = 0;
exports.getPrice=(cryptoId,fiatId)=>{
  let currencyPath = []
  let prevId =cryptoId;//reverse seek is not implemented
  while(prevId!==fiatId){
    if(prevId==="jpy"&&fiatId==="mona"){
      currencyPath.push(currencyList.get("mona").getPrice().then(r=>r?1/r:1))
      prevId="mona"
      continue
    }
    if(prevId==="jpy"&&fiatId==="usd"){
      currencyPath.push(
        exports.usdPrice
          ?Promise.resolve(exports.usdPrice)
          :axios.get(
            exports.proxyUrl("https://www.gaitameonline.com/rateaj/getrate"))
          .then(r=>{
            return (exports.usdPrice=1/parseFloat(r.data.quotes[20].ask))
          }))
      prevId="usd"
      continue
    }
    const cur = currencyList.get(prevId)
    if(!cur.price){
      return Promise.resolve(0)
    }
    currencyPath.push(cur.getPrice())
    prevId=cur.price.fiat
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
  try{
  const decipher = crypto.createDecipher('aes256', password);
    return decipher.update(cipher, 'hex', 'utf8')+decipher.final('utf8');
  }catch(e){
    throw new errors.PasswordFailureError()
  }
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
  resolve(ret)
});
  
exports.copy=data=>{
  if (window.cordova) {
    window.cordova.plugins.clipboard.copy(data)
  }else{
    const temp = document.createElement('textarea');
    temp.setAttribute('readonly', '')
    temp.textContent = data;
    
    const s = temp.style;
    s.position = 'absolute';
    s.border="0";
    s.padding="0";
    s.margin="0";
    s.left = '-999px';
    s.top=(window.pageYOffset || document.documentElement.scrollTop)+"px"

    document.body.appendChild(temp);
    temp.select()
    temp.setSelectionRange(0, temp.value.length);

    const result = document.execCommand('copy');

    document.body.removeChild(temp);
  }
}
exports.openUrl=(url)=>{
  if(!window.cordova){
    window.open(url,"_blank")
    return
  }
  window.cordova.plugins.browsertab.isAvailable(
    result=> {
      if (result)  {
        window.cordova.plugins.browsertab.openUrl(
          url,
          success=>{},
          fail=>{
            window.open(url,"_blank")
          });
      }
    },
    na=> {
      window.open(url,"_blank")
    });
};
exports.getBip21=(bip21Urn,address,query,addrUrl=false)=>{
  let queryStr="?"
  if(addrUrl){
    query.address = address
    query.scheme = bip21Urn
    for(let v in query){
      if(query[v]){
        queryStr+=encodeURIComponent(v)+"="+encodeURIComponent(query[v])+"&"
      }
    }
    return "https://missmonacoin.github.io/monya/a/"+queryStr
  }
  
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
    signature:"",
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
      ret.address=raw.pathname||raw.hostname
      if (v.isValidAddress(ret.address)) {
        ret.isPrefixOk=true
      }
      ret.isValidAddress=exports.isValidAddress(ret.address)
      ret.message=raw.searchParams.get("message")
      ret.label=raw.searchParams.get("label")
      ret.amount=raw.searchParams.get("amount")
      ret.opReturn=raw.searchParams.get("req-opreturn")
      ret.signature=raw.searchParams.get("req-signature")
      ret.utxo=raw.searchParams.get("req-utxo")
    }
  })
  
  resolve(ret)
})

exports.proxyUrl=url=>{
  if(exports.isNative()){
    return url
  }else{
    return 'https://zaif-status.herokuapp.com/proxy/?u='+encodeURIComponent(url)
  }
}
exports.shortWait=()=>new Promise(r=>{
  setTimeout(r,150)
})
exports._url=""
exports._urlCb=null
exports.queueUrl=url=>{
  exports._url=url
  if(exports.hasInitialized){
    exports._urlCb&&exports._urlCb(exports._url)
  }
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
exports.setInitialized=(flag)=>{
  
  if(exports.hasInitialized!==flag){
    exports.hasInitialized=flag
    exports._urlCb&&exports._urlCb(exports._url)
  }
}

exports.buildBuilderfromPubKeyTx=(transaction,network)=>{
  let txb = new bcLib.TransactionBuilder(network)
  txb.setVersion(transaction.version)
  txb.setLockTime(transaction.locktime)
  transaction.outs.forEach(function (txOut) {
    txb.addOutput(txOut.script, txOut.value)
  })
  transaction.ins.forEach(function (txIn) {
    txb.addInput(txIn.hash, txIn.index,txIn.sequence,txIn.script)
  })
  return txb
}

exports.isNative = ()=>window.cordova&&window.cordova.platformId!=="browser"
exports.share = (option,pos)=> new Promise((resolve,reject)=>{
  if(!window.plugins.socialsharing){
    return
  }
  window.plugins.socialsharing.setIPadPopupCoordinates(pos)
  window.plugins.socialsharing.shareWithOptions(option,resolve,reject)
})
