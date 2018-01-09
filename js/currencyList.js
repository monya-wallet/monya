const Currency = require("./currency")
const axios = require('axios');
const coinUtil=require("../js/coinUtil")

const defaultCoins=[
  {//key = coinId that is lowercase ticker symbol
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
    sound:require("../res/coins/paySound/mona.m4a"),
    enableSegwit:false,
    prefixes:["M","P"],
    price:{
      url:"https://public.bitbank.cc/mona_jpy/ticker",
      json:true,
      jsonPath:["data","last"],
      fiat:"jpy"
    },
    confirmations:6,
    counterpartyEndpoint:"https://wallet.monaparty.me/_api"
  },{
    coinScreenName:"ビットコイン",
    coinId:"btc",
    unit:"BTC",
    unitEasy:"ビットコイン",
    bip44:{
      coinType:0,
      account:0
    },
    bip21:"bitcoin",
    defaultFeeSatPerByte:10000,
    icon:require("../res/coins/btc.png"),
    defaultAPIEndpoint:"https://insight.bitpay.com/api",
    network:{
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 0,// 1
      scriptHash: 5,// 3
      wif: 128
    },
    enableSegwit:false,
    prefixes:["1","3"],
    price:{
      url:"https://public.bitbank.cc/btc_jpy/ticker",
      json:true,
      jsonPath:["data","last"],
      fiat:"jpy"
    },
    confirmations:12
  },
  {
    coinScreenName:"ビットゼニー",
    coinId:"zny",
    unit:"ZNY",
    unitEasy:"ゼニー",
    bip44:{
      coinType:123,
      account:0
    },
    bip21:"bitzeny",
    defaultFeeSatPerByte:200,
    icon:require("../res/coins/zny.png"),
    defaultAPIEndpoint:"https://zenyinsight.tomotomo9696.xyz/api",
    network:{
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 81,// Z
      scriptHash: 5,// 3
      wif: 128
    },
    enableSegwit:false,
    prefixes:["Z","3"],
    price:{
      url:coinUtil.proxyUrl("https://www.coingecko.com/price_charts/bitzeny/jpy/24_hours.json"),
      json:true,
      jsonPath:["stats",0,1],
      fiat:"jpy"
    },
    sound:require("../res/coins/paySound/zny.m4a")
  },{
    coinScreenName:"ライトコイン",
    coinId:"ltc",
    unit:"LTC",
    unitEasy:"ライトコイン",
    bip44:{
      coinType:2,//from slip44
      account:0
    },
    bip21:"litecoin",
    defaultFeeSatPerByte:500,//will implement dynamic fee
    icon:require("../res/coins/ltc.png"),
    defaultAPIEndpoint:"https://insight.litecore.io/api",
    network:{
      messagePrefix: '\x19Litecoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 48,// L
      scriptHash: 5,// 3
      wif: 176,
      bech32:"lc1"
    },
    enableSegwit:false,
    prefixes:["L","3"],
    price:{
      url:"https://public.bitbank.cc/ltc_btc/ticker",
      json:true,
      jsonPath:["data","last"],
      fiat:"btc"
    },
    confirmations:6
  },{
    coinScreenName:"フジコイン",
    coinId:"fjc",
    unit:"FJC",
    unitEasy:"フジコイン",
    bip44:{
      coinType:75,
      account:0
    },
    bip21:"fujicoin",
    defaultFeeSatPerByte:200,//will implement dynamic fee
    icon:require("../res/coins/fjc.png"),
    defaultAPIEndpoint:coinUtil.proxyUrl("http://explorer.fujicoin.org/api"),
    network:{
      messagePrefix: '\x19Fujicoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 36,// F
      scriptHash: 17,// 3
      wif: 164,//not known but i put it 36+128
      bech32:"fuji1"
    },
    enableSegwit:false,
    prefixes:["F","7"],
    price:{
      url:coinUtil.proxyUrl("https://www.coingecko.com/price_charts/fujicoin/jpy/24_hours.json"),
      json:true,
      jsonPath:["stats",0,1],
      fiat:"jpy"
    },
    confirmations:6
  }
]


const coins={}

/**
 * Get supported Currencies
 * @param {function} fn(Currency).
 */
exports.each=(fn)=>{
  
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
exports.eachWithDummy=(fn)=>{
    
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
exports.eachWithPub=(fn)=>{
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
exports.init =customCoins=>{
  for(let i = 0;i<defaultCoins.length;i++){
    const defCoin = defaultCoins[i]
    coins[defCoin.coinId]=new Currency(defCoin)
  }
  for(let i = 0;i<customCoins.length;i++){
    const defCoin = customCoins[i]
    coins[defCoin.coinId]=new Currency(defCoin)
  }
}
exports.addCurrency=customCoin=>{
  coins[customCoin.coinId]=customCoin
}
