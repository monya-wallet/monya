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

const Currency = require("./currency");
const coinUtil = require("./coinUtil");
const j = require("./lang").getLang() === "ja";

// Coin id should be lowercase ticker symbol. Add prefix if this coin is different coin like testnet. Add suffix if this coin is compatible with the original coin but different mode like SegWit, Monacoin-3-Prefix

const defaultCoins = [
  {
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
    apiEndpoints: [
      {
        url: "https://blockbook.electrum-mona.org/api",
        explorer: "https://blockbook.electrum-mona.org",
        type: "blockbook"
      },
      {
        url: "https://mona.blockbook.ovh/api",
        explorer: "https://mona.blockbook.ovh",
        type: "blockbook"
      },
      {
        url: "https://insight.electrum-mona.org/insight-api-monacoin",
        explorer: "https://insight.electrum-mona.org/insight",
        type: "insight"
      },
      {
        url: "https://mona.insight.monaco-ex.org/insight-api-monacoin",
        explorer: "https://mona.insight.monaco-ex.org/insight",
        type: "insight"
      }
    ],
    network: {
      messagePrefix: "\x19Monacoin Signed Message:\n",
      bip32: {
        public: 0x0488b21e,

        private: 0x0488ade4
      },
      pubKeyHash: 50,
      scriptHash: 55,
      wif: 176,
      bech32: "mona"
    },
    sound: require("../res/coins/paySound/mona.m4a"),
    enableSegwit: false,
    price: {
      url:
        "https://api.coingecko.com/api/v3/simple/price?ids=monacoin&vs_currencies=jpy",
      json: true,
      jsonPath: "$.monacoin.jpy",
      fiat: "jpy"
    },
    confirmations: 6,
    counterparty: {
      endpoints: ["https://monapa.electrum-mona.org/_api"],
      nativeSymbol: "XMP"
    },
    opReturnLength: 83,
    isAtomicSwapAvailable: true
  },
  {
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
    apiEndpoints: [
      {
        url: "https://bitzeny-blockbook.ilmango.work/api",
        explorer: "https://bitzeny-blockbook.ilmango.work",
        type: "blockbook"
      },
      {
        url: "https://zny.blockbook.ovh/api",
        explorer: "https://zny.blockbook.ovh",
        type: "blockbook"
      },
      {
        url: "https://zenyinsight.tomotomo9696.xyz/api",
        explorer: "https://zenyinsight.tomotomo9696.xyz",
        type: "insight"
      },
      {
        url: "https://insight.bitzeny.jp/api",
        explorer: "https://insight.bitzeny.jp",
        type: "insight"
      }
    ],
    network: {
      messagePrefix: "\x18BitZeny Signed Message:\n",
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
      },
      pubKeyHash: 81,
      scriptHash: 5,
      wif: 128,
      bech32: "bz"
    },
    enableSegwit: false,
    price: {
      url:
        "https://api.coingecko.com/api/v3/simple/price?ids=bitzeny&vs_currencies=jpy",
      json: true,
      jsonPath: "$.bitzeny.jpy",
      fiat: "jpy"
    },
    sound: require("../res/coins/paySound/zny.m4a"),
    opReturnLength: 40, //server seems currently not to support
    isAtomicSwapAvailable: true
  },
  {
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
    apiEndpoints: [
      {
        url: "https://btc1.trezor.io/api",
        explorer: "https://btc1.trezor.io",
        type: "blockbook",
        proxy: true
      },
      {
        explorer: "https://bitpay.com/insight/#/BTC/mainnet",
        url: "https://api.bitcore.io/api/BTC/mainnet",
        type: "insight"
      }
    ],
    network: {
      messagePrefix: "\x18Bitcoin Signed Message:\n",
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
      jsonPath: "$.data.last",
      fiat: "jpy"
    },
    confirmations: 6,
    counterparty: {
      endpoints: ["https://wallet.counterwallet.io/_api"],
      nativeSymbol: "XCP"
    },
    opReturnLength: 83,
    isAtomicSwapAvailable: true
  },
  {
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
    apiEndpoints: [
      {
        url: "https://ltc1.trezor.io/api",
        explorer: "https://ltc1.trezor.io",
        type: "blockbook",
        proxy: true
      },
      {
        url: "https://ltc2.trezor.io/api",
        explorer: "https://ltc2.trezor.io",
        type: "blockbook",
        proxy: true
      },
      {
        url: "https://insight.litecore.io/api",
        explorer: "https://insight.litecore.io",
        type: "insight"
      }
    ],
    network: {
      messagePrefix: "\x19Litecoin Signed Message:\n",
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
      jsonPath: "$.data.last",
      fiat: "btc"
    },
    confirmations: 6,
    opReturnLength: 83,
    isAtomicSwapAvailable: true
  },
  {
    coinScreenName: j ? "富士コイン" : "Fujicoin",
    coinId: "fjc",
    unit: "FJC",
    unitEasy: j ? "富士コイン" : "Fujicoin",
    bip44: {
      coinType: 75,
      account: 0
    },
    bip21: "fujicoin",
    defaultFeeSatPerByte: 20000,
    icon: require("../res/coins/fjc.png"),
    apiEndpoints: [
      {
        url: "https://explorer.fujicoin.org/api",
        explorer: "https://explorer.fujicoin.org",
        type: "blockbook"
      }
    ],
    network: {
      messagePrefix: "\x19FujiCoin Signed Message:\n",
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
      },
      pubKeyHash: 36,
      scriptHash: 16,
      wif: 164,
      bech32: "fc"
    },
    enableSegwit: false,
    price: {
      url: "https://min-api.cryptocompare.com/data/price?fsym=FJC&tsyms=JPY",
      json: true,
      jsonPath: "$.JPY",
      fiat: "jpy"
    },
    confirmations: 6,
    opReturnLength: 83,
    isAtomicSwapAvailable: true
  },
  {
    coinScreenName: "クマコイン",
    coinId: "kuma",
    unit: "KUMA",
    unitEasy: "クマ",
    bip44: {
      coinType: 2000, //not from slip44, if it is not in slip44, set from 2000
      account: 0
    },
    bip21: "kumacoin",
    defaultFeeSatPerByte: 20000, //will implement dynamic fee
    icon: require("../res/coins/kuma.png"),
    apiEndpoints: [
      {
        url: "https://kumabook.electrum-mona.org/api",
        explorer: "https://kumabook.electrum-mona.org",
        type: "blockbook"
      },
      {
        url:
          "https://namuyan.tk/MultiLightBlockExplorer/apis.php?data=kuma/api",
        explorer:
          "https://namuyan.tk/MultiLightBlockExplorer/index.php?page=selectcoin&coin=kuma",
        type: "insight"
      }
    ],
    network: {
      messagePrefix: "\x19KumaCoin Signed Message:\n",
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
      },
      pubKeyHash: 45,
      scriptHash: 8,
      wif: 173
    },
    enableSegwit: false,
    lib: "blk",
    price: {
      url:
        "https://api.coingecko.com/api/v3/simple/price?ids=kumacoin&vs_currencies=jpy",
      json: true,
      jsonPath: "$.kumacoin.jpy",
      fiat: "jpy"
    },
    confirmations: 6,
    opReturnLength: 0,
    isAtomicSwapAvailable: false
  },
  {
    coinScreenName: j ? "ビップスターコイン" : "VIPSTARCOIN",
    coinId: "vips",
    unit: "VIPS",
    unitEasy: j ? "ビップス" : "VIPS",
    bip44: {
      coinType: 1919,
      account: 0
    },
    bip21: "vipstarcoin",
    defaultFeeSatPerByte: 400,
    icon: require("../res/coins/vips.png"),
    apiEndpoints: [
      {
        url: "https://insight.vipstarco.in/api",
        explorer: "https://insight.vipstarco.in",
        type: "insight"
      },
      {
        url: "https://vips.blockbook.japanesecoin-pool.work/api",
        explorer: "https://vips.blockbook.japanesecoin-pool.work",
        type: "blockbook"
      },
      {
        url: "https://insight.vipstar.be/api",
        explorer: "https://insight.vipstar.be",
        type: "insight"
      }
    ],
    network: {
      messagePrefix: "\x1cVIPSTARCOIN Signed Message:\n",
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
      },
      pubKeyHash: 70,
      scriptHash: 50,
      wif: 128,
      bech32: "vips"
    },
    enableSegwit: false,
    price: {
      url:
        "https://api.coingecko.com/api/v3/simple/price?ids=vipstarcoin&vs_currencies=jpy",
      json: true,
      jsonPath: "$.vipstarcoin.jpy",
      fiat: "jpy"
    },
    confirmations: 6,
    opReturnLength: 83,
    isAtomicSwapAvailable: true
  },
  {
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
    apiEndpoints: [
      {
        url: "https://btc1.trezor.io/api",
        explorer: "https://btc1.trezor.io",
        type: "blockbook",
        proxy: true
      },
      {
        url: "https://btc2.trezor.io/api",
        explorer: "https://btc2.trezor.io",
        type: "blockbook",
        proxy: true
      },
      {
        url: "https://btc3.trezor.io/api",
        explorer: "https://btc3.trezor.io",
        type: "blockbook",
        proxy: true
      }
    ],
    network: {
      messagePrefix: "\x18Bitcoin Signed Message:\n",
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
      jsonPath: "$.data.last",
      fiat: "jpy"
    },
    confirmations: 6,
    counterparty: {
      endpoints: ["https://wallet.counterwallet.io/_api"],
      nativeSymbol: "XCP"
    },
    opReturnLength: 83,
    isAtomicSwapAvailable: false
  },
  {
    coinScreenName: j ? "ビットコインキャッシュ ABC" : "Bitcoin Cash ABC",
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
    apiEndpoints: [
      {
        explorer: "https://bch1.trezor.io",
        url: "https://bch1.trezor.io/api",
        type: "blockbook",
        proxy: true
      },
      {
        explorer: "https://bch2.trezor.io",
        url: "https://bch2.trezor.io/api",
        type: "blockbook",
        proxy: true
      }
    ],
    network: {
      messagePrefix: "\x18Bitcoin Signed Message:\n",
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
      jsonPath: "$.data.last",
      fiat: "jpy"
    },
    confirmations: 6,
    opReturnLength: 83, // change after hard fork,
    isAtomicSwapAvailable: true
  },
  {
    coinScreenName: j ? "コト" : "Koto",
    coinId: "koto",
    unit: "KOTO",
    unitEasy: j ? "コト" : "Koto",
    bip44: {
      coinType: 2001,
      account: 0
    },
    bip21: "koto",
    defaultFeeSatPerByte: 200,
    icon: require("../res/coins/koto.png"),
    network: {
      messagePrefix: "\u0015Koto Signed Message:\n",
      bip32: {
        public: 76067358,
        private: 76066276
      },
      pubKeyHash: 6198,
      scriptHash: 6203,
      txversion: 4,
      versionGroupId: 0x9023e50a,
      wif: 128
    },
    price: {
      url:
        "https://api.coingecko.com/api/v3/simple/price?ids=koto&vs_currencies=jpy",
      json: true,
      jsonPath: "$.koto.jpy",
      fiat: "jpy"
    },
    enableSegwi: false,
    confirmations: 6,
    lib: "zec",
    apiEndpoints: [
      {
        url: "https://blockbook.kotocoin.info/api",
        explorer: "https://blockbook.kotocoin.info",
        type: "blockbook"
      },
      {
        url: "https://koto.blockbook.ovh/api",
        explorer: "https://koto.blockbook.ovh",
        type: "blockbook"
      },
      {
        url: "https://insight.kotocoin.info/api",
        explorer: "https://insight.kotocoin.info",
        type: "insight"
      }
    ],
    opReturnLength: 80,
    isAtomicSwapAvailable: true
  },
  {
    coinScreenName: j ? "ダッシュ" : "Dash",
    coinId: "dash",
    unit: "DASH",
    unitEasy: j ? "ダッシュ" : "Dash",
    bip44: {
      coinType: 5,
      account: 0
    },
    bip21: "dash",
    defaultFeeSatPerByte: 200,
    icon: require("../res/coins/dash.png"),
    network: {
      messagePrefix: "\u0019DarkCoin Signed Message:\n",
      bip32: {
        public: 76067358,
        private: 76066276
      },
      pubKeyHash: 76,
      scriptHash: 16,
      wif: 204
    },
    enableSegwit: false,
    confirmations: 6,
    apiEndpoints: [
      {
        url: "https://dash1.trezor.io/api",
        explorer: "https://dash1.trezor.io",
        type: "blockbook",
        proxy: true
      },
      {
        url: "https://dash2.trezor.io/api",
        explorer: "https://dash2.trezor.io",
        type: "blockbook",
        proxy: true
      },
      {
        url: "https://insight.dash.org/insight-api-dash",
        explorer: "https://insight.dash.org/insight",
        type: "insight"
      },
      {
        url: "https://insight.dash.siampm.com/api",
        explorer: "https://insight.dash.siampm.com",
        type: "insight"
      }
    ],
    opReturnLength: 83,
    isAtomicSwapAvailable: true
  },
  {
    coinScreenName: j ? "ジーキャッシュ" : "Zcash",
    coinId: "zec",
    unit: "ZEC",
    unitEasy: "Zcash",
    bip44: {
      coinType: 133,
      account: 0
    },
    bip21: "zcash",
    defaultFeeSatPerByte: 200,
    icon: require("../res/coins/zec.png"),
    network: {
      messagePrefix: "\u0016Zcash Signed Message:\n",
      bip32: {
        public: 76067358,
        private: 76066276
      },
      pubKeyHash: 7352,
      scriptHash: 7357,
      txversion: 4,
      versionGroupId: 0x892f2085,
      wif: 128
    },
    apiEndpoints: [
      {
        url: "https://zcash.blockexplorer.com/api",
        explorer: "https://zcash.blockexplorer.com",
        type: "insight"
      },
      {
        url: "https://zcashnetwork.info/api",
        explorer: "https://zcashnetwork.info",
        type: "insight"
      },
      {
        url: "https://explorer.zcashfr.io/api",
        explorer: "https://explorer.zcashfr.io",
        type: "insight"
      }
    ],
    lib: "zec",
    opReturnLength: 80,
    isAtomicSwapAvailable: true
  },
  {
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
    apiEndpoints: [
      {
        url: "https://insight.neetcoin.jp/api",
        explorer: "https://insight.neetcoin.jp",
        type: "insight"
      }
    ],
    network: {
      messagePrefix: "\x19NEETCOIN Signed Message:\n",
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
      url:
        "https://api.coingecko.com/api/v3/simple/price?ids=neetcoin&vs_currencies=jpy",
      json: true,
      jsonPath: "$.neetcoin.jpy",
      fiat: "jpy"
    },
    opReturnLength: 0,
    isAtomicSwapAvailable: false
  }
];

const coins = {};

/**
 * Get supported Currencies
 * @param {function} fn(Currency).
 */
exports.each = fn => {
  for (let curName in coins) {
    if (coins[curName] instanceof Currency && !coins[curName].dummy) {
      fn(coins[curName]);
    }
  }
};

/**
 * Get Available Currencies with dummy(such as fiat currency)
 * @param {function} fn(Currency).
 */
exports.eachWithDummy = fn => {
  for (let curName in coins) {
    if (coins[curName] instanceof Currency) {
      fn(coins[curName]);
    }
  }
};
/**
 * Get Available Currencies which have pubkey
 * @param {function} fn(Currency).
 */
exports.eachWithPub = fn => {
  for (let curName in coins) {
    if (coins[curName] instanceof Currency && coins[curName].hdPubNode) {
      fn(coins[curName]);
    }
  }
};

/**
 * Get a currency
 * @param {String} coinId.
 */
exports.get = coinId => {
  if (coins[coinId] instanceof Currency) {
    return coins[coinId];
  }
};
exports.init = customCoins => {
  for (let i = 0; i < defaultCoins.length; i++) {
    const defCoin = defaultCoins[i];
    coins[defCoin.coinId] = new Currency(defCoin);
  }
  for (let i = 0; i < customCoins.length; i++) {
    const defCoin = customCoins[i];
    try {
      coins[defCoin.coinId] = new Currency(defCoin);
    } catch (e) {
      continue;
    }
  }
  exports.isSingleWallet = defaultCoins.length + customCoins.length < 2;
};
exports.isSingleWallet = false;
