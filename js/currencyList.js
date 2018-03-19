
const Currency = require("./currency")
const coinUtil=require("./coinUtil")
const j = require("./lang").getLang()==="ja"

// Coin id should be lowercase ticker symbol. Add prefix if this coin is different coin like testnet. Add suffix if this coin is compatible with the original coin but different mode like SegWit, Monacoin-3-Prefix

const defaultCoins=[
  {
    coinScreenName:j?"モナコイン":"Monacoin",
    coinId:"mona",
    unit:"MONA",
    unitEasy:j?"モナ":"Mona",
    bip44:{
      coinType:22,
      account:0
    },
    bip21:"monacoin",
    defaultFeeSatPerByte:200,
    icon:require("../res/coins/mona.png"),
    apiEndpoints:[
      {
        url:"https://mona.monya.ga/insight-api-monacoin",
        explorer:"https://mona.monya.ga/insight"
      },
      {
        url:"https://mona.insight.monaco-ex.org/insight-api-monacoin",
        explorer:"https://mona.insight.monaco-ex.org/insight"
      }
    ],
    explorer:"https://mona.insight.monaco-ex.org/insight",
    network:{
      messagePrefix: '\x19Monacoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 50,
      scriptHash: 55,
      wif: 178,//new wif
      bech32:"mona"
    },
    sound:require("../res/coins/paySound/mona.m4a"),
    enableSegwit:false,
    price:{
      url:"https://public.bitbank.cc/mona_jpy/ticker",
      json:true,
      jsonPath:'$.data.last',
      fiat:"jpy"
    },
    confirmations:6,
    counterpartyEndpoint:"https://wallet.monaparty.me/_api"
  },{
    coinScreenName:j?"ビットゼニー":"BitZeny",
    coinId:"zny",
    unit:"ZNY",
    unitEasy:j?"ゼニー":"Zeny",
    bip44:{
      coinType:123,
      account:0
    },
    bip21:"bitzeny",
    defaultFeeSatPerByte:200,
    icon:require("../res/coins/zny.png"),
    apiEndpoints:[
      {url:"https://zeny.insight.monaco-ex.org/api",
       explorer:"https://zeny.insight.monaco-ex.org"},
      {url:"https://zenyinsight.tomotomo9696.xyz/api",
       explorer:"https://zenyinsight.tomotomo9696.xyz"
      },{url:"https://insight.bitzeny.jp/api",explorer:"https://insight.bitzeny.jp"},
      {url:"https://insight.bitzeny.cloud/api",explorer:"https://insight.bitzeny.cloud"}
    ],
    network:{
      messagePrefix: '\x18BitZeny Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 81,
      scriptHash: 5,
      wif: 128
    },
    enableSegwit:false,
    price:{
      url:"https://insight.neetcoin.jp/api/ticker",
      json:true,
      jsonPath:'$[?(@.id=="ZNY_BTC")].last',
      fiat:"btc"
    },
    sound:require("../res/coins/paySound/zny.m4a")
  },{
    coinScreenName:j?"ビットコイン":"Bitcoin",
    coinId:"btc",
    unit:"BTC",
    unitEasy:j?"ビットコイン":"Bitcoin",
    bip44:{
      coinType:0,
      account:0
    },
    bip21:"bitcoin",
    defaultFeeSatPerByte:100,
    icon:require("../res/coins/btc.png"),
    apiEndpoints:[{url:"https://btc-bitcore1.trezor.io/api",explorer:"https://btc-bitcore1.trezor.io"},{explorer:"https://insight.bitpay.com",url:"https://insight.bitpay.com"}],
    network:{
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 0,
      scriptHash: 5,
      wif: 128
    },
    enableSegwit:false,
    price:{
      url:"https://public.bitbank.cc/btc_jpy/ticker",
      json:true,
      jsonPath:'$.data.last',
      fiat:"jpy"
    },
    confirmations:6,
    counterpartyEndpoint:"https://wallet.counterwallet.io/_api"
  },{
    coinScreenName:j?"ライトコイン":"Litecoin",
    coinId:"ltc",
    unit:"LTC",
    unitEasy:j?"ライトコイン":"Litecoin",
    bip44:{
      coinType:2,
      account:0
    },
    bip21:"litecoin",
    defaultFeeSatPerByte:500,
    icon:require("../res/coins/ltc.png"),
    apiEndpoints:[{url:"https://insight.litecore.io/api",
    explorer:"https://insight.litecore.io"}],
    network:{
      messagePrefix: '\x19Litecoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 48,
      scriptHash: 5,
      wif: 176,
      bech32:"lc"
    },
    enableSegwit:false,
    price:{
      url:"https://public.bitbank.cc/ltc_btc/ticker",
      json:true,
      jsonPath:'$.data.last',
      fiat:"btc"
    },
    confirmations:6
  },{
    coinScreenName:j?"フジコイン":"FujiCoin",
    coinId:"fjc",
    unit:"FJC",
    unitEasy:j?"フジコイン":"FujiCoin",
    bip44:{
      coinType:75,
      account:0
    },
    bip21:"fujicoin",
    defaultFeeSatPerByte:200,
    icon:require("../res/coins/fjc.png"),
    apiEndpoints:[{
      url:"http://explorer.fujicoin.org/api",
      explorer:"http://explorer.fujicoin.org",
      proxy:true
    }],
    network:{
      messagePrefix: '\x19Fujicoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
      },
      pubKeyHash: 36,
      scriptHash: 16,
      wif: 164
    },
    enableSegwit:false,
    price:{
      url:coinUtil.proxyUrl("https://www.coingecko.com/price_charts/fujicoin/jpy/24_hours.json"),
      json:true,
      jsonPath:'$.stats[-1:][1]',
      fiat:"jpy"
    },
    confirmations:6
  },{
    coinScreenName:j?"ビットコイン(SegWit)":"Bitcoin(SegWit)",
    coinId:"btcsw",
    unit:"BTC(SW)",
    unitEasy:j?"ビットコイン(SW)":"Bitcoin(SW)",
    bip49:{
      coinType:0,
      account:0
    },
    bip21:"bitcoin",
    defaultFeeSatPerByte:100,
    icon:require("../res/coins/btcsw.png"),
    apiEndpoints:[{url:"https://btc-bitcore1.trezor.io/api",explorer:"https://btc-bitcore1.trezor.io"},{explorer:"https://insight.bitpay.com",url:"https://insight.bitpay.com"}],
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
      jsonPath:'$.data.last',
      fiat:"jpy"
    },
    confirmations:6,
    counterpartyEndpoint:"https://wallet.counterwallet.io/_api"
  },{
    coinScreenName:j?"ビットコインキャッシュ":"Bitcoin Cash",
    coinId:"bch",
    unit:"BCH",
    unitEasy:j?"ビッチ":"BitCh",
    bip44:{
      coinType:145,
      account:0
    },
    bip21:"bitcoincash",
    defaultFeeSatPerByte:100,
    icon:require("../res/coins/bch.png"),
    apiEndpoints:[{url:"https://bch-bitcore1.trezor.io/api",explorer:"https://bch-bitcore1.trezor.io"}],
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
    lib:"bch",
    price:{
      url:"https://public.bitbank.cc/bcc_jpy/ticker",
      json:true,
      jsonPath:'$.data.last',
      fiat:"jpy"
    },
    confirmations:6
  },{
	  "coinScreenName": j?"コト":"Koto",
	  "coinId": "koto",
	  "unit": "KOTO",
	  "unitEasy": "コト",
	  "bip44": {
		  "coinType": 2001,
		  "account": 0
	  },
	  "bip21": "koto",
	  "defaultFeeSatPerByte": 200,
	  "icon": require("../res/coins/koto.png"),
	  "network": {
		  "messagePrefix": "\u0015Koto Signed Message:\n",
		  "bip32": {
			  "public": 76067358,
			  "private": 76066276
		  },
		  "pubKeyHash": 6198,
		  "scriptHash": 6203,
		  "wif": 128
	  },
	  "enableSegwit": false,
	  "confirmations": 6,
	  "lib": "zec",
	  "apiEndpoints": [
		  {
			  "url": "https://insight.kotocoin.info/api",
			  "explorer": "https://insight.kotocoin.info"
		  }
	  ]
  },{
    coinScreenName: j?"NEETCOIN":"NeetCoin",
    coinId: "neet",
    unit: "NEET",
    unitEasy: j?"ニート":"Neet",
    bip44: {
      coinType: 0,
      account: 0
    },
    bip21: "neetcoin",
    defaultFeeSatPerByte: 50,
    icon: require("../res/coins/neet.png"),
    apiEndpoints:[{url:"https://insight.neetcoin.jp/api",explorer:"https://insight.neetcoin.jp"}],
    network: {
      messagePrefix: '\x19NEETCOIN Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
      },
      pubKeyHash: 53, // N
      scriptHash: 112, // n
      wif: 181
    },
    enableSegwit: false,
    lib: "blk",
    price: {
      url: "https://insight.neetcoin.jp/api/ticker",
      json: true,
      jsonPath: '$[?(@.id=="NEET_BTC")].last',
      fiat: "btc"
    }
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
    try{
      coins[defCoin.coinId]=new Currency(defCoin)
    }catch(e){
      
    }
  }
  exports.isSingleWallet = (defaultCoins.length+customCoins.length)<2
}
exports.isSingleWallet = false
