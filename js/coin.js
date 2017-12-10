const bcLib = require('bitcoinjs-lib')
const bip39 = require("bip39")
const crypto = require('crypto');
const param = require("./param")
const currencyList = require("./currencyList")
const api = require("./api")

let currentKeyPairs={};

exports.makePairsAndEncrypt = (option)=> new Promise((resolve, reject) => {
  let seed;
  if(option.entropy){
    seed=bip39.mnemonicToSeed(bip39.entropyToMnemonic(option.entropy))
  }else if(option.mnemonic){
    seed=bip39.mnemonicToSeed(this.$store.state.entropy)
  }else if(option.seed){
    seed= option.seed
  }
  const ret ={}
  for(let coinId in currencyList){
    const pub = currencyList[coinId].seedToPubB58(seed)
    const cipher = crypto.createCipher('aes256', option.password);
    let encrypted = cipher.update(currencyList[coinId].seedToPrivB58(seed), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    ret[coinId]={
      public:pub,
      private:encrypted
    }
  }
  resolve(ret)
});
exports.decryptAndRestore=(cipher,password)=> new Promise((resolve, reject) => {
  const decipher = crypto.createDecipher('aes256', password);
  let decrypted = decipher.update(cipher, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  for(let coinId in param.coins){
    currentKeyPairs[coinId] = bcLib.HDNode.fromBase58(decrypted,param.coins[coinId].network)
  }
  resolve()
});
exports.getMonaAddress = (index)=>{
  return currentKeyPairs["mona"].derivePath("m/44'/22'/0'/0/"+(index||0)).getAddress()//BIP 44
}
exports.getAddress = (coinId,index=0)=>{
  return currentKeyPairs[coinId].deriveHardened(44).deriveHardened(param.coins[coinId].bip44CoinType).deriveHardened(0).derive(0).derive(index).getAddress() //BIP 44
}

exports.isValidAddress = addr =>{
  try{
    bcLib.address.fromBase58Check(addr)
    return true
  }catch(e){
    return false
  }
}


exports.selectUtxos = (addr,amt2Wd) => new Promise((resolve, reject) => {
  api.getAddressProp(addr,"utxo").then(res=>{
    const utxos=[]
    let amount=0;
    let i=0;
    res.sort((a,b)=>{
      return b.balance-a.balance;
    })
    
    while(amount<=amt2Wd&&res[i]){
      amount+=res[i].amount
      utxos.push(res[i])
      i++
    }
    resolve(utxos)
  })
});


exports.buildTransaction = (payload) => new Promise((resolve, reject) => {
  debugger;
  const txb = new bcLib.TransactionBuilder(param.coins[payload.coinId].network)
  if(payload.message){
    txb.addOutput(bcLib.script.nullData.output.encode(Buffer.from(payload.message, 'utf8')),0)
  }else if(payload.messageBuffer){
    txb.addOutput(bcLib.script.nullData.output.encode(payload.messageBuffer),0)
  }

  const utxos=payload.utxos
  let uBalance=0;
  for(let i=0;i<utxos.length;i++){
    uBalance+=utxos[i].amount
    txb.addInput(utxos[i].txid,utxos[i].vout)
  }
  if(uBalance>=payload.fee+payload.amount){
    txb.addOutput(payload.address,payload.amount*100000000)
    let change =uBalance-payload.amount-payload.fee;
    if(change<=0){
      txb.addOutput(payload.changeAddress,change*100000000)
    }
  }else{
    throw new Error("Insufficient fund")
  }
  txb.sign(0, currentKeyPairs[payload.coinId]
           .deriveHardened(44)
           .deriveHardened(param.coins[payload.coinId].bip44CoinType)
           .deriveHardened(0)
           .derive(0)
           .derive(payload.keyIndex).keyPair
          )
  
  resolve(txb.build().toHex())
});

