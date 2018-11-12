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

const Currency = require("./currency")
const coinUtil = require("./coinUtil")
const j = require("./lang").getLang() === "ja"

// Coin id should be lowercase ticker symbol. Add prefix if this coin is different coin like testnet. Add suffix if this coin is compatible with the original coin but different mode like SegWit, Monacoin-3-Prefix

const defaultCoins = [{
  coinScreenName: j ? "モナコイン" : "Monacoin",
  coinId: "mona",
  unit: "MONA",
  unitEasy: j ? "モナ" : "Mona",
  bip44: {
    coinType: 22,
    account: 0
  },
  bip21: "monacoin",
  defaultFeeSatPerByte: 150,
  icon: require("../res/coins/mona.png"),
  apiEndpoints: [{
    url: "https://mona.monacoin.ml/insight-api-monacoin",
    explorer: "https://mona.monacoin.ml/insight"
  },{
    url: "https://mona.insight.monaco-ex.org/insight-api-monacoin",
    explorer: "https://mona.insight.monaco-ex.org/insight"
  },{
    url: "https://insight.electrum-mona.org/insight-api-monacoin",
    explorer: "https://insight.electrum-mona.org/insight"
  }],
  network: {
    messagePrefix: '\x19Monacoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,

      private: 0x0488ade4
    },
    pubKeyHash: 50,
    scriptHash: 55,
    wif: 178, //new wif
    bech32: "mona"
  },
  sound: require("../res/coins/paySound/mona.m4a"),
  enableSegwit: false,
  price: {
    url: "https://public.bitbank.cc/mona_jpy/ticker",
    json: true,
    jsonPath: '$.data.last',
    fiat: "jpy"
  },
  confirmations: 6,
  counterparty:{
    endpoints: ["https://monaparty.tk/_api","https://wallet.monaparty.me/_api"],
    nativeSymbol:"XMP"
  },
  opReturnLength: 83,
  isAtomicSwapAvailable: true
}, {
  coinScreenName: j ? "ビットゼニー" : "BitZeny",
  coinId: "zny",
  unit: "ZNY",
  unitEasy: j ? "ゼニー" : "Zeny",
  bip44: {
    coinType: 123,
    account: 0
  },
  bip21: "bitzeny",
  defaultFeeSatPerByte: 150,
  icon: require("../res/coins/zny.png"),
  apiEndpoints: [{
    url: "https://zenyinsight.tomotomo9696.xyz/api",
    explorer: "https://zenyinsight.tomotomo9696.xyz"
  }, {
    url: "https://insight.bitzeny.jp/api",
    explorer: "https://insight.bitzeny.jp"
  }, {
    url: "https://zeny.fujishan.jp/api",
    explorer: "https://zeny.fujishan.jp"
  },{
    url: "https://insight.bitzeny.cloud/api",
    explorer: "https://insight.bitzeny.cloud"
  }],
  network: {
    messagePrefix: '\x18BitZeny Signed Message:\n',
    bip32: {
      public: 0x0488b21e,

      private: 0x0488ade4
    },
    pubKeyHash: 81,
    scriptHash: 5,
    wif: 128,bech32:"sz"
  },
  enableSegwit: false,
  price: {
    url: "https://api.crypto-bridge.org/api/v1/ticker",
    json: true,
    jsonPath: '$[?(@.id=="ZNY_BTC")].last',
    fiat: "btc"
  },
  sound: require("../res/coins/paySound/zny.m4a"),
  opReturnLength: 40, //server seems currently not to support
  isAtomicSwapAvailable: true
}, {
  coinScreenName: j ? "ビットコイン" : "Bitcoin",
  coinId: "btc",
  unit: "BTC",
  unitEasy: j ? "ビットコイン" : "Bitcoin",
  bip44: {
    coinType: 0,
    account: 0
  },
  bip21: "bitcoin",
  defaultFeeSatPerByte: 100,
  icon: require("../res/coins/btc.png"),
  apiEndpoints: [{
    explorer: "https://www.localbitcoinschain.com",
    url: "https://www.localbitcoinschain.com/api"
  },{
    url: "https://blockexplorer.com/api",
    explorer: "https://blockexplorer.com"
  },{
    explorer: "https://btc.coin.space",
    url: "https://btc.coin.space/api"
  },{
    url: "https://core.monacoin.ml/insight-api",
    explorer: "https://core.monacoin.ml/insight"
  },{
    explorer: "https://explorer.bitcoin.com/btc",
    url: "https://explorer.bitcoin.com/api/btc"
  },{
    url: "https://btc.blockdozer.com/insight-api",
    explorer: "https://btc.blockdozer.com"
  },{
    explorer: "https://insight.bitpay.com",
    url: "https://insight.bitpay.com/api"
  },{
    url: "https://btc-bitcore4.trezor.io/api",
    explorer: "https://btc-bitcore4.trezor.io"
  }],
  network: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,

      private: 0x0488ade4
    },
    pubKeyHash: 0,
    scriptHash: 5,
    bech32: "bc",
    wif: 128
  },
  enableSegwit: false,
  price: {
    url: "https://public.bitbank.cc/btc_jpy/ticker",
    json: true,
    jsonPath: '$.data.last',
    fiat: "jpy"
  },
  confirmations: 6,
  counterparty:{endpoints: ["https://wallet.counterwallet.io/_api"],nativeSymbol:"XCP"},
  opReturnLength: 83,
  isAtomicSwapAvailable: true
}, {
  coinScreenName: j ? "ライトコイン" : "Litecoin",
  coinId: "ltc",
  unit: "LTC",
  unitEasy: j ? "ライトコイン" : "Litecoin",
  bip44: {
    coinType: 2,
    account: 0
  },
  bip21: "litecoin",
  defaultFeeSatPerByte: 300,
  icon: require("../res/coins/ltc.png"),
  apiEndpoints: [{
    url: "https://insight.litecore.io/api",
    explorer: "https://insight.litecore.io"
  },{
    explorer: "https://ltc.coin.space",
    url: "https://ltc.coin.space/api"
  },{
    url:"https://ltc.monacoin.ml/insight-lite-api",
    explorer:"https://ltc.monacoin.ml/insight"
  }],
  network: {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,

      private: 0x0488ade4
    },
    pubKeyHash: 48,
    scriptHash: 5,
    wif: 176,
    bech32: "ltc"
  },
  enableSegwit: false,
  price: {
    url: "https://public.bitbank.cc/ltc_btc/ticker",
    json: true,
    jsonPath: '$.data.last',
    fiat: "btc"
  },
  confirmations: 6,
  opReturnLength: 83,
  isAtomicSwapAvailable: true
}, {
  coinScreenName: j ? "フジコイン" : "FujiCoin",
  coinId: "fjc",
  unit: "FJC",
  unitEasy: j ? "フジコイン" : "FujiCoin",
  bip44: {
    coinType: 75,
    account: 0
  },
  bip21: "fujicoin",
  defaultFeeSatPerByte: 200,
  icon: require("../res/coins/fjc.png"),
  apiEndpoints: [{
    url: "http://explorer.fujicoin.org/api",
    explorer: "http://explorer.fujicoin.org",
    proxy: true
  }],
  network: {
    messagePrefix: '\x19Fujicoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 36,
    scriptHash: 16,
    wif: 164
  },
  enableSegwit: false,
  price: {
    url: "https://min-api.cryptocompare.com/data/price?fsym=FJC&tsyms=JPY",
    json: true,
    jsonPath: '$.JPY',
    fiat: "jpy"
  },
  confirmations: 6,
  opReturnLength: 83,
  isAtomicSwapAvailable: true
}, {
  coinScreenName: j ? "ビットコイン(SegWit)" : "Bitcoin(SegWit)",
  coinId: "btcsw",
  unit: "BTC(SW)",
  unitEasy: j ? "ビットコイン(SW)" : "Bitcoin(SW)",
  bip49: {
    coinType: 0,
    account: 0
  },
  bip21: "bitcoin",
  defaultFeeSatPerByte: 100,
  icon: require("../res/coins/btcsw.png"),
  apiEndpoints: [{
    url: "https://blockexplorer.com/api",
    explorer: "https://blockexplorer.com"
  },{
    explorer: "https://explorer.bitcoin.com/btc",
    url: "https://explorer.bitcoin.com/api/btc"
  },{
    explorer: "https://insight.bitpay.com",
    url: "https://insight.bitpay.com/api"
  },{
    explorer: "https://btc.coin.space",
    url: "https://btc.coin.space/api"
  },{
    url: "https://btc1.trezor.io/api",
    explorer: "https://btc1.trezor.io"
  },{
    url: "https://btc.blockdozer.com/insight-api",
    explorer: "https://btc.blockdozer.com"
  },{
    url: "https://core.monacoin.ml/insight-api",
    explorer: "https://core.monacoin.ml/insight"
  },{
    explorer: "https://www.localbitcoinschain.com",
    url: "https://www.localbitcoinschain.com/api"
  }],
  network: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,

      private: 0x0488ade4
    },
    pubKeyHash: 0, // 1
    scriptHash: 5, // 3
    bech32: "bc",
    wif: 128
  },
  enableSegwit: "legacy",
  price: {
    url: "https://public.bitbank.cc/btc_jpy/ticker",
    json: true,
    jsonPath: '$.data.last',
    fiat: "jpy"
  },
  confirmations: 6,
  counterparty:{endpoints: ["https://wallet.counterwallet.io/_api"],nativeSymbol:"XCP"},
  opReturnLength: 83,
  isAtomicSwapAvailable: false
}, {
  coinScreenName: j ? "ビットコインキャッシュ" : "Bitcoin Cash",
  coinId: "bch",
  unit: "BCH",
  unitEasy: j ? "ビッチ" : "BitCh",
  bip44: {
    coinType: 145,
    account: 0
  },
  bip21: "bitcoincash",
  defaultFeeSatPerByte: 100,
  icon: require("../res/coins/bch.png"),
  apiEndpoints: [{
    explorer: "https://bitcoincash.blockexplorer.com",
    url: "https://bitcoincash.blockexplorer.com/api"
  },{
    explorer: "https://bch.coin.space",
    url: "https://bch.coin.space/api"
  },{
    explorer: "https://explorer.bitcoin.com/bch", 
    url: "https://explorer.bitcoin.com/api/bch"
 },{
    explorer: "https://cash.monacoin.ml/insight",
    url: "https://cash.monacoin.ml/insight-api"
  }],
  network: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,

      private: 0x0488ade4
    },
    pubKeyHash: 0, // 1
    scriptHash: 5, // 3
    wif: 128
  },
  enableSegwit: false,
  lib: "bch",
  price: {
    url: "https://public.bitbank.cc/bcc_jpy/ticker",
    json: true,
    jsonPath: '$.data.last',
    fiat: "jpy"
  },
  confirmations: 6,
  opReturnLength: 83, // change after hard fork,
  isAtomicSwapAvailable: true
}, {
  "coinScreenName": j ? "コト" : "Koto",
  "coinId": "koto",
  "unit": "KOTO",
  "unitEasy": j ? "コト" : "Koto",
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
    "txversion": 3,
    "versionGroupId": 48748912,
    "wif": 128
  },
  price: {
    url: "https://zaif-status.herokuapp.com/priceEtherProxy/koto",
    json: true,
    jsonPath: 'result',
    fiat: "btc"
  },
  "enableSegwit": false,
  "confirmations": 6,
  "lib": "zec",
  "apiEndpoints": [{
    "url": "https://koto.monacoin.ml/insight-api-koto",
    "explorer": "https://koto.monacoin.ml/insight"
  },{
    "url": "https://insight.kotocoin.info/api",
    "explorer": "https://insight.kotocoin.info"
  }],
  opReturnLength: 80,
  isAtomicSwapAvailable: true
}, {
  "coinScreenName": j ? "ダッシュ" : "Dash",
  "coinId": "dash",
  "unit": "DASH",
  "unitEasy": j ? "ダッシュ" : "Dash",
  "bip44": {
    "coinType": 5,
    "account": 0
  },
  "bip21": "dash",
  "defaultFeeSatPerByte": 200,
  "icon": require("../res/coins/dash.png"),
  "network": {
    "messagePrefix": "\u0019DarkCoin Signed Message:\n",
    "bip32": {
      "public": 76067358,
      "private": 76066276
    },
    "pubKeyHash": 76,
    "scriptHash": 16,
    "wif": 204
  },
  "enableSegwit": false,
  "confirmations": 6,
  "apiEndpoints": [{
    url: "https://insight.dash.org/insight-api-dash",
    explorer: "https://insight.dash.org/insight"
  },{
    url: "https://insight.dash.siampm.com/api",
    explorer: "https://insight.dash.siampm.com"
  },{
    "url": "https://dash-bitcore1.trezor.io/api",
    "explorer": "https://dash-bitcore1.trezor.io"
  }],
  opReturnLength: 83,
  isAtomicSwapAvailable: true
}, {
  "coinScreenName": j ? "ジーキャッシュ" : "Zcash",
  "coinId": "zec",
  "unit": "ZEC",
  "unitEasy": "Zcash",
  "bip44": {
    "coinType": 133,
    "account": 0
  },
  "bip21": "zcash",
  "defaultFeeSatPerByte": 200,
  "icon": require("../res/coins/zec.png"),
  "network": {
    "messagePrefix": "\u0016Zcash Signed Message:\n",
    "bip32": {
      "public": 76067358,
      "private": 76066276
    },
    "pubKeyHash": 7352,
    "scriptHash": 7357,
    "txversion": 3,
    "versionGroupId": 63210096,
    "wif": 128
  },
  "apiEndpoints": [{
    "url": "https://zcash.blockexplorer.com/api",
    "explorer": "https://zcash.blockexplorer.com"
  },{
    url: "https://zcashnetwork.info/api",
    explorer: "https://zcashnetwork.info"
  },{
    url: "https://explorer.zcashfr.io/api",
    explorer: "https://explorer.zcashfr.io"
  }],
  lib: "zec",
  opReturnLength: 80,
  isAtomicSwapAvailable: true
}, {
  coinScreenName: j ? "野獣コイン" : "Yajucoin",
  coinId: "yaju",
  unit: "YAJU",
  unitEasy: "¥",
  bip44: {
    coinType: 2005,
    account: 0
  },
  bip21: "yajucoin",
  defaultFeeSatPerByte: 50,
  icon: require("../res/coins/yaju.png"),
  apiEndpoints: [{
    url: "https://yaju.monacoin.ml/api",
    explorer: "https://yaju.monacoin.ml"
  },{
    url: "https://yaju2.monacoin.ml/api",
    explorer: "https://yaju.monacoin.ml"
  }],
  network: {
    messagePrefix: '\x19YAJUCOIN Signed Message:\n',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 78,
    scriptHash: 85, // n
    wif: 206
  },
  enableSegwit: false,
  lib: "blk",
  opReturnLength: 0,
  isAtomicSwapAvailable: false
},{
  coinScreenName: j ? "NEETCOIN" : "NeetCoin",
  coinId: "neet",
  unit: "NEET",
  unitEasy: j ? "ニート" : "Neet",
  bip44: {
    coinType: 2002,
    account: 0
  },
  bip21: "neetcoin",
  defaultFeeSatPerByte: 50,
  icon: require("../res/coins/neet.png"),
  apiEndpoints: [{
    url: "https://insight.neetcoin.jp/api",
    explorer: "https://insight.neetcoin.jp"
  }],
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
    url: "https://api.crypto-bridge.org/api/v1/ticker",
    json: true,
    jsonPath: '$[?(@.id=="NEET_BTC")].last',
    fiat: "btc"
  },
  opReturnLength: 0,
  isAtomicSwapAvailable: false
}
                     ]


const coins = {}

/**
 * Get supported Currencies
 * @param {function} fn(Currency).
 */
exports.each = (fn) => {

  for (let curName in coins) {
    if ((coins[curName] instanceof Currency) && (!coins[curName].dummy)) {
      fn(coins[curName])
    }
  }
}

/**
 * Get Available Currencies with dummy(such as fiat currency)
 * @param {function} fn(Currency).
 */
exports.eachWithDummy = (fn) => {

  for (let curName in coins) {
    if ((coins[curName] instanceof Currency)) {
      fn(coins[curName])
    }
  }
}
/**
 * Get Available Currencies which have pubkey
 * @param {function} fn(Currency).
 */
exports.eachWithPub = (fn) => {
  for (let curName in coins) {
    if ((coins[curName] instanceof Currency) && (coins[curName].hdPubNode)) {
      fn(coins[curName])
    }
  }
}

/**
 * Get a currency
 * @param {String} coinId.
 */
exports.get = coinId => {

  if ((coins[coinId] instanceof Currency)) {
    return coins[coinId]
  }
}
exports.init = customCoins => {
  for (let i = 0; i < defaultCoins.length; i++) {
    const defCoin = defaultCoins[i]
    coins[defCoin.coinId] = new Currency(defCoin)
  }
  for (let i = 0; i < customCoins.length; i++) {
    const defCoin = customCoins[i]
    try {
      coins[defCoin.coinId] = new Currency(defCoin)
    } catch (e) {
      continue
    }
  }
  exports.isSingleWallet = (defaultCoins.length + customCoins.length) < 2
}
exports.isSingleWallet = false
