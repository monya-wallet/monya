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
      wif: 178,//new wif
      bech32:"mona"
    },
    sound:require("../res/coins/paySound/mona.m4a"),
    enableSegwit:false,
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
    defaultFeeSatPerByte:100,
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
    price:{
      url:"https://public.bitbank.cc/btc_jpy/ticker",
      json:true,
      jsonPath:["data","last"],
      fiat:"jpy"
    },
    confirmations:6,
    counterpartyEndpoint:"https://wallet.counterwallet.io/_api"
  },{
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
    apiEndpoints:["https://zenyinsight.tomotomo9696.xyz/api","https://zeny.insight.monaco-ex.org/api"],
    network:{
      messagePrefix: '\x18BitZeny Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 81,// Z
      scriptHash: 5,// 3
      wif: 128
    },
    enableSegwit:false,
    price:{
      url:coinUtil.proxyUrl("https://www.coingecko.com/price_charts/bitzeny/jpy/24_hours.json"),
      json:true,
      jsonPath:["stats",-1,1],
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
      bech32:"lc"
    },
    enableSegwit:false,
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
      scriptHash: 16,// 7
      wif: 164
    },
    enableSegwit:false,
    price:{
      url:coinUtil.proxyUrl("https://www.coingecko.com/price_charts/fujicoin/jpy/24_hours.json"),
      json:true,
      jsonPath:["stats",-1,1],
      fiat:"jpy"
    },
    confirmations:6
  },{//key = coinId that is lowercase ticker symbol
    coinScreenName:"モナコイン(テストネット)",
    coinId:"tmona",
    unit:"MONA(Testnet)",
    unitEasy:"モナ(テストネット)",
    bip44:{
      coinType:22,//from slip44
      account:0
    },
    bip21:"testnetmonacoin",
    defaultFeeSatPerByte:200,//will implement dynamic fee
    icon:require("../res/coins/tmona.png"),
    defaultAPIEndpoint:"https://testnet-mona.insight.monaco-ex.org/insight-api-monacoin",
    network:{
      messagePrefix: '\x19Monacoin Signed Message:\n',
      bip32: {
        public: 0x043587cf,
        private: 0x04358394
      },
      pubKeyHash: 111,// M
      scriptHash: 117,// P new scripthash
      wif: 239,//new wif
      bech32:"tmona"
    },
    sound:require("../res/coins/paySound/mona.m4a"),
    enableSegwit:false,
    price:{
      url:"https://public.bitbank.cc/mona_jpy/ticker",
      json:true,
      jsonPath:["data","last"],
      fiat:"jpy"
    },
    confirmations:6,
    counterpartyEndpoint:"https://wallet-testnet.monaparty.me/_api"
  },{
    coinScreenName:"ビットコイン(Segwit)",
    coinId:"btcsw",
    unit:"BTC(SW)",
    unitEasy:"ビットコイン(SW)",
    bip44:{
      coinType:0,
      account:0
    },
    bip21:"bitcoin",
    defaultFeeSatPerByte:100,
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
    enableSegwit:"legacy",
    price:{
      url:"https://public.bitbank.cc/btc_jpy/ticker",
      json:true,
      jsonPath:["data","last"],
      fiat:"jpy"
    },
    confirmations:6,
    counterpartyEndpoint:"https://wallet.counterwallet.io/_api"
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
