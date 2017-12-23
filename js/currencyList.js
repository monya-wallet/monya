const Currency = require("./currency")
const axios = require('axios');

const coins={
  mona:new Currency({//key = coinId that is lowercase ticker symbol
    coinScreenName:"モナコイン",
    coinId:"mona",
    unit:"MONA",
    unitEasy:"モナ",
    bip44:{
      coinType:22,//from slip44
      account:0
    },
    bip21:"monacoin",
    defaultFeeSatPerByte:200,//will implement dynamic fee
    icon:require("../res/coins/mona.png"),
    defaultAPIEndpoint:"https://mona.insight.monaco-ex.org/insight-api-monacoin",
    network:{
      messagePrefix: '\x19Monacoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 50,// M
      scriptHash: 55,// P new scripthash
      wif: 176,//new wif
      bech32:"mona"
    },
    enableSegwit:false,
    prefixes:["M","P"],
    price:{
      url:"https://public.bitbank.cc/mona_jpy/ticker",
      json:true,
      jsonPath:["data","last"],
      fiat:"jpy"
    }
  }),
  
}
/**
 * Get supported Currencies
 * @param {function} fn(Currency).
 */
exports.each=(fn,mode)=>{
  for(let curName in coins){
    if((coins[curName] instanceof Currency)&&(!coins[curName].dummy)){
      fn(coins[curName])
    }
  }
}

/**
 * Get Available Currencies with dummy(such as fiat currency)
 * @param {function} fn(Currency).
 */
exports.eachWithDummy=(fn,mode)=>{
  for(let curName in coins){
    if((coins[curName] instanceof Currency)){
      fn(coins[curName])
    }
  }
}
/**
 * Get Available Currencies which have pubkey
 * @param {function} fn(Currency).
 */
exports.eachWithPub=(fn,mode)=>{
  for(let curName in coins){
    if((coins[curName] instanceof Currency)&&(coins[curName].hdPubNode)){
      fn(coins[curName])
    }
  }
}

/**
 * Get a currency
 * @param {String} coinId.
 */
exports.get=coinId=>{
  if((coins[coinId] instanceof Currency)){
    return coins[coinId]
  }
}
exports.createNewCurrency =opts=>{
  
}
