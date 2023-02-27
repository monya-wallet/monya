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
const currencyList = require("./currencyList.js");
const bcLib = require("bitcoinjs-lib");
const zecLib = require("@missmonacoin/bitcoinjs-lib-zcash");
const bip39 = require("@missmonacoin/bip39-eng");
const crypto = require("crypto");
const errors = require("./errors");
const axios = require("axios");
const ext = require("./extension.js");
const BigNumber = require("bignumber.js");

const addressRegExp = /^\w+:(?:\/\/)?(\w{10,255})\??/;

const API_PREFIX = "api_v1_";

exports.DEFAULT_LABEL_NAME = "Default";
exports.GAP_LIMIT = 20;
exports.GAP_LIMIT_FOR_CHANGE = 20;

exports.isValidAddress = addr => {
  try {
    bcLib.address.fromBase58Check(addr);
    return true;
  } catch (e) {
    try {
      bcLib.address.fromBech32(addr);
      return true;
    } catch (e1) {
      try {
        zecLib.address.fromBase58Check(addr);
        return true;
      } catch (e2) {
        return false;
      }
    }
  }
};
exports.getAddrVersion = addr => {
  try {
    return bcLib.address.fromBase58Check(addr).version;
  } catch (e) {
    try {
      return zecLib.address.fromBase58Check(addr).version;
    } catch (e2) {
      return null;
    }
  }
};
exports.usdPrice = 0;
exports.getPrice = (cryptoId, fiatId) => {
  // if user selected Nyaan, return 0 immediately
  if (fiatId === "nyaan") return Promise.resolve(0);
  let currencyPath = [];
  let prevId = cryptoId; //reverse seek is not implemented
  while (prevId !== fiatId) {
    if (prevId === "jpy" && fiatId === "mona") {
      currencyPath.push(
        currencyList
          .get("mona")
          .getPrice()
          .then(r => (r ? 1 / r : 1))
      );
      prevId = "mona";
      continue;
    }
    if (prevId === "jpy" && fiatId === "usd") {
      currencyPath.push(
        exports.usdPrice
          ? Promise.resolve(exports.usdPrice)
          : axios
              .get(
                exports.proxyUrl("https://www.gaitameonline.com/rateaj/getrate")
              )
              .then(r => {
                return (exports.usdPrice =
                  1 / parseFloat(r.data.quotes[20].ask));
              })
      );
      prevId = "usd";
      continue;
    }
    const cur = currencyList.get(prevId);
    if (!cur.price) {
      return Promise.resolve(0);
    }
    currencyPath.push(cur.getPrice());
    prevId = cur.price.fiat;
  }
  return Promise.all(currencyPath).then(v => {
    let price = 1;
    v.forEach(p => {
      price *= p;
    });
    return price;
  });
};
exports.encrypt = (plain, password) => {
  const cipher = crypto.createCipher("aes256", password);
  return cipher.update(plain, "utf8", "hex") + cipher.final("hex");
};
exports.decrypt = (cipher, password) => {
  try {
    const decipher = crypto.createDecipher("aes256", password);
    return decipher.update(cipher, "hex", "utf8") + decipher.final("utf8");
  } catch (e) {
    throw new errors.PasswordFailureError();
  }
};

exports.makePairsAndEncrypt = option =>
  new Promise(resolve => {
    let seed;
    let entropy;
    if (option.entropy) {
      entropy = option.entropy;
      seed = bip39.mnemonicToSeed(bip39.entropyToMnemonic(option.entropy));
    } else if (option.mnemonic) {
      entropy = bip39.mnemonicToEntropy(option.mnemonic);
      seed = bip39.mnemonicToSeed(option.mnemonic);
    } else {
      throw new Error("Can't generate entropy");
    }
    if (option.encryptPub) {
      resolve({ entropy: exports.encrypt(entropy, option.password) });
    } else {
      const ret = {
        entropy: "",
        pubs: {}
      };
      for (let i = 0; i < option.makeCur.length; i++) {
        let coinId = option.makeCur[i];
        let pub = currencyList.get(coinId).seedToPubB58(seed);
        ret.pubs[coinId] = pub;
      }

      ret.entropy = exports.encrypt(entropy, option.password);
      resolve(ret);
    }
  });

exports.decryptKeys = option =>
  new Promise(resolve => {
    let seed = bip39.mnemonicToSeed(
      bip39.entropyToMnemonic(
        exports.decrypt(option.entropyCipher, option.password)
      )
    );

    const ret = {};
    for (let i = 0; i < option.makeCur.length; i++) {
      let coinId = option.makeCur[i];
      const pub = currencyList.get(coinId).seedToPubB58(seed);
      ret[coinId] = pub;
    }
    resolve(ret);
  });

exports.copy = data => {
  if (window.cordova) {
    window.cordova.plugins.clipboard.copy(data);
  } else {
    const temp = document.createElement("textarea");
    temp.setAttribute("readonly", "");
    temp.textContent = data;

    const s = temp.style;
    s.position = "absolute";
    s.border = "0";
    s.padding = "0";
    s.margin = "0";
    s.left = "-999px";
    s.top = (window.pageYOffset || document.documentElement.scrollTop) + "px";

    document.body.appendChild(temp);
    temp.select();
    temp.setSelectionRange(0, temp.value.length);

    const result = document.execCommand("copy");

    document.body.removeChild(temp);
  }
};
exports.openUrl = url => {
  if (exports.isElectron()) {
    window.electronOpenExternal(url);
    return;
  }
  if (!window.cordova) {
    window.open(url, "_blank");
    return;
  }

  window.cordova.plugins.browsertab.isAvailable(
    result => {
      if (result) {
        window.cordova.plugins.browsertab.openUrl(
          url,
          success => {},
          fail => {
            window.open(url, "_blank");
          }
        );
      }
    },
    na => {
      window.open(url, "_blank");
    }
  );
};
exports.getBip21 = (bip21Urn, address, query, addrUrl = false) => {
  let queryStr = "?";
  if (addrUrl) {
    query.address = address;
    query.scheme = bip21Urn;
    for (let v in query) {
      if (query[v]) {
        queryStr +=
          encodeURIComponent(v) + "=" + encodeURIComponent(query[v]) + "&";
      }
    }
    return "https://monya-wallet.github.io/a/" + queryStr;
  }

  for (let v in query) {
    if (query[v]) {
      queryStr +=
        encodeURIComponent(v) + "=" + encodeURIComponent(query[v]) + "&";
    }
  }
  return bip21Urn + ":" + address + queryStr;
};

exports.parseUrl = async url => {
  const ret = {
    url,
    raw: null,
    protocol: "",
    isCoinAddress: false,
    isPrefixOk: false,
    isValidAddress: false,
    coinId: "",
    address: "",
    message: "",
    amount: 0,
    opReturn: "",
    signature: "",
    label: "",
    isValidUrl: false,
    extension: null,
    apiName: "",
    apiParam: null
  };
  let raw;
  try {
    raw = new URL(url);
  } catch (e) {
    return ret;
  }
  let extraDataFromR = null;
  // required for BitPay invoice
  if (raw.searchParams.get("r")) {
    extraDataFromR = (
      await axios.get(raw.searchParams.get("r"), {
        responseType: "json",
        headers: {
          Accept:
            "application/payment-request, application/bitcoin-paymentrequest"
        }
      })
    ).data.outputs[0];
  }
  ret.raw = raw;
  ret.protocol = raw.protocol.slice(0, -1);
  ret.isValidUrl = true;
  const addrRes = addressRegExp.exec(url);
  if (addrRes) {
    ret.address = addrRes[1];
  } else if (extraDataFromR) {
    ret.address = extraDataFromR.address;
  }
  if (ret.address.slice(0, API_PREFIX.length) === API_PREFIX) {
    ret.apiName = ret.address.slice(API_PREFIX.length);
    try {
      ret.apiParam = JSON.parse(raw.searchParams.get("param"));
    } catch (e) {
      ret.apiParam = null;
    }
    return ret;
  }
  ext.each(v => {
    if (ret.protocol === v.scheme) {
      ret.extension = v;
    }
  });
  currencyList.each(v => {
    if (v.bip21 === ret.protocol) {
      ret.isCoinAddress = true;
      ret.coinId = v.coinId;

      if (v.isValidAddress(ret.address)) {
        ret.isPrefixOk = true;
      }
      ret.isValidAddress = exports.isValidAddress(ret.address);
    }
  });

  ret.message = raw.searchParams.get("message");
  ret.label = raw.searchParams.get("label");
  ret.opReturn = raw.searchParams.get("req-opreturn");
  ret.signature = raw.searchParams.get("req-signature");
  ret.utxo = raw.searchParams.get("req-utxo");
  if (extraDataFromR) {
    ret.amount = new BigNumber(extraDataFromR.amount).shift(-8).toString();
    // Flag isValidAddress true
    ret.isCoinAddress = true;
    ret.isValidAddress = true;
  } else {
    ret.amount = raw.searchParams.get("amount");
  }
  return ret;
};
let apiCb;
exports.callAPI = (name, param) => {
  apiCb(name, param);
};

exports.setAPICallback = cb => {
  apiCb = cb;
};

exports.proxyUrl = url => {
  if (exports.isNative()) {
    return url;
  } else {
    url = "https://os-proxy.missmonacoin.org/?url=" + encodeURIComponent(url);
    return url;
  }
};
exports.shortWait = () =>
  new Promise(r => {
    setTimeout(r, 140);
  });
exports._url = "";
exports._urlCb = null;
exports.queueUrl = url => {
  exports._url = url;
  if (exports.hasInitialized) {
    exports._urlCb && exports._urlCb(exports._url);
  }
};
exports.getQueuedUrl = () => {
  return exports._url;
};
exports.popQueuedUrl = () => {
  const url = exports._url;
  exports._url = "";
  return url;
};
exports.setUrlCallback = cb => {
  if (typeof cb === "function") {
    exports._urlCb = cb;
  }
};
exports.hasInitialized = false;
exports.setInitialized = flag => {
  if (exports.hasInitialized !== flag) {
    exports.hasInitialized = flag;
    exports._urlCb && exports._urlCb(exports._url);
  }
};

exports.buildBuilderfromPubKeyTx = (transaction, network) => {
  let txb = new bcLib.TransactionBuilder(network);
  txb.setVersion(transaction.version);
  txb.setLockTime(transaction.locktime);
  transaction.outs.forEach(function(txOut) {
    txb.addOutput(txOut.script, txOut.value);
  });
  transaction.ins.forEach(function(txIn) {
    txb.addInput(txIn.hash, txIn.index, txIn.sequence, txIn.script);
  });
  return txb;
};
exports.isCordovaNative = () =>
  window.cordova && window.cordova.platformId !== "browser";
exports.isElectron = () => window.process && window.process.type;
exports.isNative = () => exports.isCordovaNative() || exports.isElectron();
exports.shareable = () =>
  (window.plugins && window.plugins.socialsharing) || navigator.share;
exports.share = (option, pos) =>
  new Promise((resolve, reject) => {
    if (!window.plugins || !window.plugins.socialsharing) {
      if (navigator.share) {
        return navigator.share({
          title: option.subject,
          text: option.message,
          url: option.url
        });
      } else {
        return reject();
      }
    }
    window.plugins.socialsharing.setIPadPopupCoordinates(pos);
    window.plugins.socialsharing.shareWithOptions(option, resolve, reject);
  });

exports.getNews = () => {
  return axios
    .get("https://monya-wallet.github.io/news.json")
    .then(r => r.data.news);
};
