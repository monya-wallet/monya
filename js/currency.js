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
const bcLib = require("bitcoinjs-lib");
const axios = require("axios");
const BigNumber = require("bignumber.js");
const coinSelect = require("coinselect");
const coinSelectSplit = require("coinselect/split");
const bcMsg = require("bitcoinjs-message");
const bip39 = require("@missmonacoin/bip39-eng");
const qs = require("qs");
const errors = require("./errors");
const coinUtil = require("./coinUtil");
const storage = require("./storage");
const zecLib = require("@missmonacoin/bitcoinjs-lib-zcash");
const bchLib = require("@missmonacoin/bitcoincashjs-lib");
const blkLib = require("@missmonacoin/blackcoinjs-lib");
const jp = require("jsonpath");
const bs58check = require("bs58check");
const secp256k1 = require("secp256k1");
const explorer = require("./explorers");

module.exports = class {
  constructor(opt) {
    this.coinId = opt.coinId;
    this.coinScreenName = opt.coinScreenName;
    this.unit = opt.unit;
    this.unitEasy = opt.unitEasy;
    this.bip44 = opt.bip44;
    this.bip49 = opt.bip49;
    this.apiEndpoints = opt.apiEndpoints;
    this.changeApiEndpoint(0);
    this.network = opt.network;
    this.price = opt.price;
    this.dummy = !!opt.dummy;
    this.icon = opt.icon;
    this.bip21 = opt.bip21;
    this.defaultFeeSatPerByte = opt.defaultFeeSatPerByte;
    this.confirmations = opt.confirmations || 6;
    this.sound = opt.sound || "";
    this.counterparty = opt.counterparty;
    this.enableSegwit = opt.enableSegwit;
    this.opReturnLength = opt.opReturnLength < 0 ? 40 : opt.opReturnLength;
    this.isAtomicSwapAvailable = !!opt.isAtomicSwapAvailable;
    this.libName = opt.lib;
    switch (opt.lib) {
      case "zec":
        this.lib = zecLib;
        break;
      case "bch":
        this.lib = bchLib;
        break;
      case "btg":
        this.lib = bchLib;
        break;
      case "blk":
        this.lib = blkLib;
        break;
      default:
        this.lib = bcLib;
    }
    if (opt.counterparty) {
      this.counterpartyEndpoint = opt.counterparty.endpoints[0];
    }
    this.hdPubNode = null;
    this.lastPriceTime = 0;
    this.priceCache = 0;
    this.changeIndex = -1;
    this.changeBalance = 0;
    this.addresses = {};
    this.apiIndex = 0;
  }

  setPubSeedB58(seed) {
    if (this.dummy) {
      return;
    }
    this.hdPubNode = this.lib.HDNode.fromBase58(seed, this.network);
  }
  pregenerateAddress() {
    this.getReceiveAddr();
    this.getChangeAddr();
  }
  getAddressProp(propName, address, noTxList = false) {
    if (this.dummy) {
      return Promise.resolve();
    }
    return this.apiHost.getAddressProp(propName, address, noTxList);
  }
  getReceiveAddr(limit) {
    if (!limit) {
      limit = coinUtil.GAP_LIMIT;
    }
    const adrss = [];
    for (let i = 0; i <= limit; i++) {
      adrss.push(this.getAddress(0, i));
    }
    return adrss;
  }
  getChangeAddr(limit) {
    if (!limit) {
      limit = coinUtil.GAP_LIMIT_FOR_CHANGE;
    }
    const adrss = [];
    for (let i = 0; i <= limit; i++) {
      adrss.push(this.getAddress(1, i));
    }
    return adrss;
  }
  getIndexFromAddress(addr) {
    for (let p in this.addresses) {
      if (this.addresses[p] === addr) {
        return p.split(",");
      }
    }
    return false;
  }
  getReceiveBalance(includeUnconfirmedFunds, fallback) {
    return this.getUtxos(
      this.getReceiveAddr(),
      includeUnconfirmedFunds,
      fallback
    );
  }
  getChangeBalance(includeUnconfirmedFunds, fallback) {
    return this.getUtxos(
      this.getChangeAddr(),
      includeUnconfirmedFunds,
      fallback
    ).then(d => {
      let newestCnf = Infinity;
      let newestAddr = "";
      const res = d.utxos;
      for (let i = 0; i < res.length; i++) {
        if (res[i].confirmations < newestCnf) {
          newestCnf = res[i].confirmations;
          newestAddr = res[i].address;
        }
      }
      this.changeIndex = newestAddr
        ? this.getIndexFromAddress(newestAddr)[1] %
          coinUtil.GAP_LIMIT_FOR_CHANGE
        : -1;

      return {
        balance: d.balance,
        unconfirmed: d.unconfirmed
      };
    });
  }

  getWholeBalanceOfThisAccount() {
    if (this.dummy) {
      return Promise.resolve();
    }
    return Promise.all([
      this.getReceiveBalance(false),
      this.getChangeBalance(false, false)
    ]).then(vals => ({
      balance: new BigNumber(vals[0].balance).add(vals[1].balance).toNumber(),
      unconfirmed: new BigNumber(vals[0].unconfirmed)
        .add(vals[1].unconfirmed)
        .toNumber()
    }));
  }

  retryWithApiSwitch(func, fallback = true, cnt = 0) {
    return func().catch(r => {
      if (!fallback || cnt > 3) {
        throw r;
      }
      this.changeApiEndpoint();
      return this.retryWithApiSwitch(func, true, ++cnt);
    });
  }

  getUtxosRaw(addressList, fallback = true, cnt = 0) {
    return this.retryWithApiSwitch(
      () => this.apiHost.getUtxos(addressList),
      fallback,
      cnt
    );
  }
  getUtxos(addressList, includeUnconfirmedFunds = false, fallback = true) {
    let promise;
    if (typeof addressList[0] === "string") {
      //address mode
      promise = this.getUtxosRaw(addressList, fallback);
    } else {
      // manual utxo mode
      promise = Promise.resolve({ data: addressList });
    }

    return promise.then(v => {
      const utxos = [];
      let bal = new BigNumber(0);
      let unconfirmed = new BigNumber(0);
      for (let i = 0; i < v.length; i++) {
        bal = bal.add(v[i].amount);
        const u = v[i];
        if (includeUnconfirmedFunds || u.confirmations) {
          utxos.push({
            value: new BigNumber(u.amount)
              .times(100000000)
              .round()
              .toNumber(),
            txId: u.txid,
            vout: u.vout,
            address: u.address,
            confirmations: u.confirmations
          });
        } else {
          unconfirmed = unconfirmed.add(u.amount);
        }
      }
      return {
        balance: bal.toNumber(),
        utxos,
        unconfirmed: unconfirmed.toNumber()
      };
    });
  }

  getAddress(change, index) {
    if (this.dummy) {
      return;
    }
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }

    if (typeof index !== "number") {
      throw new errors.InvalidIndexError();
    }
    const addrKey = (change | 0).toString() + "," + (index | 0).toString();
    if (this.addresses[addrKey]) {
      return this.addresses[addrKey];
    } else {
      if (this.enableSegwit === "legacy") {
        return (this.addresses[addrKey] = this.getSegwitLegacyAddress(
          change,
          index
        ));
      }
      return (this.addresses[addrKey] = this.hdPubNode
        .derive(change)
        .derive(index)
        .getAddress());
    }
  }
  getPubKey(change, index) {
    if (this.dummy) {
      return;
    }
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }

    if (typeof index !== "number") {
      throw new errors.InvalidIndexError();
    }
    return this.hdPubNode
      .derive(change)
      .derive(index)
      .keyPair.getPublicKeyBuffer()
      .toString("hex");
  }
  getSegwitNativeAddress(change, index) {
    if (this.dummy) {
      return;
    }
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }
    if (typeof index !== "number") {
      index = this.receiveIndex;
    }
    const keyPair = this.hdPubNode.derive(change).derive(index).keyPair;
    const witnessPubKey = this.lib.script.witnessPubKeyHash.output.encode(
      this.lib.crypto.hash160(keyPair.getPublicKeyBuffer())
    );

    const address = this.lib.address.fromOutputScript(
      witnessPubKey,
      this.network
    );
    return address;
  }
  getSegwitLegacyAddress(change, index) {
    if (this.dummy) {
      return;
    }
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }
    if (typeof index !== "number") {
      index = this.receiveIndex;
    }
    const keyPair = this.hdPubNode.derive(change).derive(index).keyPair;
    const redeemScript = this.lib.script.witnessPubKeyHash.output.encode(
      this.lib.crypto.hash160(keyPair.getPublicKeyBuffer())
    );
    const scriptPubKey = bcLib.script.scriptHash.output.encode(
      bcLib.crypto.hash160(redeemScript)
    );

    const address = this.lib.address.fromOutputScript(
      scriptPubKey,
      this.network
    );
    return address;
  }

  getMultisig(pubKeyBufArr, neededSig) {
    const redeemScript = this.lib.script.multisig.output.encode(
      neededSig | 0,
      pubKeyBufArr
    );
    const scriptPubKey = this.lib.script.scriptHash.output.encode(
      this.lib.crypto.hash160(redeemScript)
    );
    const address = this.lib.address.fromOutputScript(
      scriptPubKey,
      this.network
    );
    return {
      address,
      scriptPubKey,
      redeemScript
    };
  }

  seedToPubB58(privSeed) {
    if (this.dummy) {
      return;
    }
    let node;
    if (typeof privSeed === "string") {
      node = this.lib.HDNode.fromBase58(privSeed, this.network);
    } else {
      node = this.lib.HDNode.fromSeedBuffer(privSeed, this.network);
    }
    if (this.bip44) {
      return node
        .deriveHardened(44)
        .deriveHardened(this.bip44.coinType)
        .deriveHardened(this.bip44.account)
        .neutered()
        .toBase58();
    }
    if (this.bip49) {
      return node
        .deriveHardened(49)
        .deriveHardened(this.bip49.coinType)
        .deriveHardened(this.bip49.account)
        .neutered()
        .toBase58();
    }
  }
  seedToPrivB58(privSeed) {
    if (this.dummy) {
      return;
    }
    let node;
    if (typeof privSeed === "string") {
      node = this.lib.HDNode.fromBase58(privSeed, this.network);
    } else {
      node = this.lib.HDNode.fromSeedBuffer(privSeed, this.network);
    }
    return node.toBase58();
  }
  _getKeyPair(entropyCipher, password, change, index) {
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }
    let node;
    if (arguments.length === 3) {
      node = entropyCipher;
      index = change;
      change = password;
    } else {
      node = this.lib.HDNode.fromSeedBuffer(
        bip39.mnemonicToSeed(
          bip39.entropyToMnemonic(coinUtil.decrypt(entropyCipher, password))
        ),
        this.network
      );
    }
    if (arguments.length === 2) {
      return node;
    }
    if (this.bip44) {
      return node
        .deriveHardened(44)
        .deriveHardened(this.bip44.coinType)
        .deriveHardened(this.bip44.account)
        .derive(change | 0)
        .derive(index | 0).keyPair;
    }
    if (this.bip49) {
      return node
        .deriveHardened(49)
        .deriveHardened(this.bip49.coinType)
        .deriveHardened(this.bip49.account)
        .derive(change | 0)
        .derive(index | 0).keyPair;
    }
    throw new errors.InvalidIndexError();
  }
  getPrice() {
    return new Promise((resolve, reject) => {
      if (!this.price) {
        return resolve(0);
      }

      if (this.lastPriceTime + 1000 * 60 < Date.now()) {
        axios({
          method: this.price.method || "get",
          url: this.price.url,
          responseType: this.price.json ? "json" : "text"
        })
          .then(res => {
            let temp = res.data;
            if (this.price.json) {
              temp = jp.query(temp, this.price.jsonPath);
            }
            this.priceCache = temp;
            this.lastPriceTime = Date.now();
            resolve(temp);
          })
          .catch(reject);
      } else {
        resolve(this.priceCache);
      }
    });
  }
  buildTransaction(option) {
    if (this.dummy) {
      return null;
    }
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }
    return new Promise((resolve, reject) => {
      const { targets, feeRate, split } = option;

      const txb = new this.lib.TransactionBuilder(this.network);

      let param;
      if (option.utxoStr) {
        param = JSON.parse(option.utxoStr);
      } else {
        param = this.getReceiveAddr().concat(this.getChangeAddr());
      }

      this.getUtxos(param, option.includeUnconfirmedFunds)
        .then(res => {
          const path = [];

          let { inputs, outputs, fee } = split
            ? coinSelectSplit(res.utxos, targets, feeRate)
            : coinSelect(res.utxos, targets, feeRate);

          if (!inputs || !outputs) throw new errors.NoSolutionError();

          inputs.forEach(input => {
            if (this.coinId === "kuma") {
              Object.assign(input, {
                value: input.value / 100
              });
            }

            const vin = txb.addInput(input.txId, input.vout);
            txb.inputs[vin].value = input.value;
            path.push(this.getIndexFromAddress(input.address));
          });

          outputs.forEach(output => {
            if (this.coinId === "kuma") {
              Object.assign(output, {
                value: output.value / 100
              });
            }

            if (!output.address) {
              output.address = this.getAddress(
                1,
                (this.changeIndex + 1) % coinUtil.GAP_LIMIT_FOR_CHANGE
              );
            }
            txb.addOutput(output.address, output.value);
          });

          resolve({
            txBuilder: txb,
            balance: res.balance,
            utxos: inputs,
            path,
            fee,
            outputs
          });
        })
        .catch(reject);
    });
  }
  signTx(option) {
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }
    const entropyCipher = option.entropyCipher;
    const password = option.password;
    let txb = option.txBuilder;
    const path = option.path;

    const node = this._getKeyPair(entropyCipher, password);

    if (!txb) {
      txb = coinUtil.buildBuilderfromPubKeyTx(
        this.lib.Transaction.fromHex(option.hash),
        this.network
      );

      for (let i = 0; i < txb.inputs.length; i++) {
        txb.sign(i, this._getKeyPair(node, path[0][0], path[0][1]));
      }
      return txb.build();
    }

    for (let i = 0; i < path.length; i++) {
      let keyPair;

      keyPair = this._getKeyPair(node, path[i][0], path[i][1]);

      if (this.enableSegwit) {
        const redeemScript = this.lib.script.witnessPubKeyHash.output.encode(
          this.lib.crypto.hash160(keyPair.getPublicKeyBuffer())
        );
        txb.sign(i, keyPair, redeemScript, null, txb.inputs[i].value);
      } else if (this.libName === "bch") {
        txb.enableBitcoinCash(true);
        txb.sign(
          i,
          keyPair,
          null,
          this.lib.Transaction.SIGHASH_ALL |
            this.lib.Transaction.SIGHASH_BITCOINCASHBIP143,
          txb.inputs[i].value
        );
      } else if (this.libName === "btg") {
        txb.enableBitcoinGold(true);
        txb.sign(
          i,
          keyPair,
          null,
          this.lib.Transaction.SIGHASH_ALL |
            this.lib.Transaction.SIGHASH_BITCOINCASHBIP143,
          txb.inputs[i].value
        );
      } else if (this.libName === "zec" && this.network.txversion === 3) {
        txb.sign(
          i,
          keyPair,
          null,
          this.lib.Transaction.SIGHASH_ALL,
          txb.inputs[i].value,
          null,
          3
        );
      } else if (this.libName === "zec" && this.network.txversion === 4) {
        txb.sign(
          i,
          keyPair,
          null,
          this.lib.Transaction.SIGHASH_ALL,
          txb.inputs[i].value,
          null,
          4
        );
      } else {
        txb.sign(i, keyPair);
      }
    }
    return txb.build();
  }
  signMultisigTx(option) {
    if (!this.hdPubNode) {
      throw new errors.HDNodeNotFoundError();
    }
    const entropyCipher = option.entropyCipher;
    const password = option.password;
    let txb = option.txBuilder;
    const path = option.path; // this is not signTx() one. path=[0,0]
    const mSig = this.getMultisig(option.pubKeyBufArr, option.neededSig);

    const node = this._getKeyPair(entropyCipher, password);

    for (let i = 0; i < txb.inputs.length; i++) {
      txb.sign(i, this._getKeyPair(node, path[0], path[1]), mSig.redeemScript);
    }
    if (option.complete) {
      return txb.build();
    } else {
      return txb.buildIncomplete();
    }
  }
  signMessage(m, entropyCipher, password, path) {
    const kp = this._getKeyPair(entropyCipher, password, path[0], path[1]);
    return bcMsg
      .sign(m, kp.d.toBuffer(32), kp.compressed, this.network.messagePrefix)
      .toString("base64");
  }
  signHash(hash, entropyCipher, password, path) {
    const kp = this._getKeyPair(entropyCipher, password, path[0], path[1]);
    const sigObj = secp256k1.sign(hash, kp.d.toBuffer(32));
    return {
      signature: sigObj.signature,
      recovery: sigObj.recovery,
      compressed: kp.compressed
    };
  }
  verifyMessage(m, a, s) {
    return bcMsg.verify(m, a, s, this.network.messagePrefix);
  }
  pushTx(hex) {
    if (this.dummy) {
      return Promise.resolve();
    }
    return this.retryWithApiSwitch(() => this.apiHost.pushTx(hex));
  }

  getTxs(from, to) {
    if (this.dummy) {
      return Promise.resolve();
    }
    return this.retryWithApiSwitch(() =>
      this.apiHost.getTxs(
        from,
        to,
        this.getReceiveAddr().concat(this.getChangeAddr())
      )
    );
  }

  getTx(txId) {
    if (this.dummy) {
      return Promise.resolve();
    }
    return this.retryWithApiSwitch(() => this.apiHost.getTx(txId));
  }
  getTxLabel(txId) {
    return storage.get("txLabels").then(res => {
      if (res && res[this.coinId]) {
        if (txId) {
          return res[this.coinId][txId] || {};
        }
        return res[this.coinId];
      } else {
        return {};
      }
    });
  }
  saveTxLabel(txId, payload) {
    return storage.get("txLabels").then(res => {
      if (!res) {
        res = {};
      }
      if (!res[this.coinId]) {
        res[this.coinId] = {};
      }
      const txs = res[this.coinId][txId];
      if (txs) {
        payload.price && (txs.price = payload.price);
        payload.label && (txs.label = payload.label);
        payload.read && (txs.read = true);
      } else {
        res[this.coinId][txId] = {
          price: payload.price || 0,
          label: payload.label || "",
          read: true
        };
      }
      return storage.set("txLabels", res);
    });
  }

  getLabels() {
    return storage.get("labels").then(res => {
      if (res && res[this.coinId]) {
        return res[this.coinId];
      } else {
        return [coinUtil.DEFAULT_LABEL_NAME];
      }
    });
  }
  updateLabel(name, newName) {
    return storage.get("labels").then(res => {
      if (!res || !res[this.coinId]) {
        throw new Error("Label object for this currency is not created yet.");
      }
      const index = res[this.coinId].indexOf(name);
      if (index >= 0) {
        res[this.coinId][index] = newName;
        return storage.set("labels", res);
      }
      throw new errors.LabelNotFoundError();
    });
  }
  createLabel(name) {
    return storage.get("labels").then(res => {
      if (!res) {
        res = {};
      }
      if (!res[this.coinId]) {
        res[this.coinId] = [coinUtil.DEFAULT_LABEL_NAME];
      }
      if (res[this.coinId].length > exports.GAP_LIMIT) {
        throw new errors.TooManyLabelsError();
      }
      if (res[this.coinId].indexOf(name) <= 0) {
        res[this.coinId].push(name);
      }
      return storage.set("labels", res);
    });
  }

  callCP(method, params) {
    if (!this.counterparty.endpoints) {
      throw new errors.ParameterNotFoundError();
    }
    return axios
      .post(
        this.counterparty.endpoints[
          Math.floor(Math.random() * this.counterparty.endpoints.length)
        ],
        {
          params,
          id: 0,
          jsonrpc: "2.0",
          method
        }
      )
      .then(r => {
        if (r.data.error && r.data.error.code) {
          throw r.data.error.data;
        }
        return r.data.result;
      });
  }
  callCPLib(method, params) {
    if (!this.counterparty.endpoints) {
      throw new errors.ParameterNotFoundError();
    }
    return axios
      .post(
        this.counterparty.endpoints[
          Math.floor(Math.random() * this.counterparty.endpoints.length)
        ],
        {
          params: {
            method,
            params
          },
          id: 0,
          jsonrpc: "2.0",
          method: "proxy_to_counterpartyd"
        }
      )
      .then(r => {
        if (r.data.error && r.data.error.code) {
          throw r.data.error.data;
        }
        return r.data.result;
      });
  }
  sweep(priv, addr, feeRate, ignoreVersion = false) {
    if (ignoreVersion) {
      const orig = bs58check.decode(priv);
      const hash = orig.slice(1);
      const version = this.network.wif;
      const payload = Buffer.allocUnsafe(orig.length);
      payload.writeUInt8(version, 0);
      hash.copy(payload, 1);
      priv = bs58check.encode(payload);
    }
    const keyPair = this.lib.ECPair.fromWIF(priv, this.network);
    return this.getUtxos([keyPair.getAddress()]).then(r => {
      const txb = new this.lib.TransactionBuilder(this.network);
      const { outputs } = coinSelectSplit(r.utxos, [{}], +feeRate);
      r.utxos.forEach((v, i) => {
        txb.addInput(v.txId, v.vout);
      });
      txb.addOutput(addr, outputs[0].value);
      r.utxos.forEach((v, i) => {
        if (this.enableSegwit) {
          const redeemScript = this.lib.script.witnessPubKeyHash.output.encode(
            this.lib.crypto.hash160(keyPair.getPublicKeyBuffer())
          );
          txb.sign(i, keyPair, redeemScript, null, v.value);
        } else if (this.libName === "bch") {
          txb.enableBitcoinCash(true);
          txb.sign(
            i,
            keyPair,
            null,
            this.lib.Transaction.SIGHASH_ALL |
              this.lib.Transaction.SIGHASH_BITCOINCASHBIP143,
            v.value
          );
        } else if (this.libName === "btg") {
          txb.enableBitcoinGold(true);
          txb.sign(
            i,
            keyPair,
            null,
            this.lib.Transaction.SIGHASH_ALL |
              this.lib.Transaction.SIGHASH_BITCOINCASHBIP143,
            v.value
          );
        } else if (this.libName === "zec" && this.network.txversion === 3) {
          txb.sign(
            i,
            keyPair,
            null,
            this.lib.Transaction.SIGHASH_ALL,
            v.value,
            null,
            true
          );
        } else {
          txb.sign(i, keyPair);
        }
      });

      return this.pushTx(txb.build().toHex());
    });
  }
  getBlocks() {
    return this.apiHost.getBlocks();
  }
  changeApiEndpoint(index) {
    if (typeof index !== "number") {
      index = this.apiIndex + 1;
    }
    this.apiIndex = index % this.apiEndpoints.length;
    const a = this.apiEndpoints[this.apiIndex];
    if (a.proxy) {
      this.apiEndpoint = coinUtil.proxyUrl(a.url);
    } else {
      this.apiEndpoint = a.url;
    }
    if (a.explorer) {
      this.explorer = a.explorer;
    }
    if (a.socket) {
      this.socketEndpoint = a.socket;
    }
    this.apiHost = explorer.getByType(
      a.type || "insight",
      this.apiEndpoint,
      a.explorer
    );
  }
  getAddrVersion(addr) {
    if (this.libName === "zec") {
      return zecLib.address.fromBase58Check(addr).version;
    } else {
      return bcLib.address.fromBase58Check(addr).version;
    }
  }
  isValidAddress(address) {
    try {
      const ver = this.getAddrVersion(address); //throws if not correct version
      if (ver === this.network.pubKeyHash || ver === this.network.scriptHash) {
        return true;
      }
    } catch (e) {
      try {
        if (
          this.lib.address.fromBech32(address).prefix === this.network.bech32
        ) {
          return true;
        }
      } catch (e2) {
        return false;
      }
    }
    return false;
  }
  openExplorer(opt) {
    const urls = this.apiHost.explorerUrls(opt);
    for (let i in urls) {
      coinUtil.openUrl(urls[i]);
    }
  }
};
