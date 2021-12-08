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
const storage = require("./storage.js");
const hdkey = require("ethereumjs-wallet/hdkey");
const bip39 = require("@missmonacoin/bip39-eng");
const keypairs = require("ripple-keypairs");

const nem = require("nem-sdk").default;

const bcLib = require("bitcoinjs-lib");
const extensions = {
  xrp: {
    id: "xrp",
    name: "Ripple",
    component: () => import("../component/xrp.js"),
    icon: require("../res/coins/xrp.png"),
    scheme: "ripple",
    onAdd: (entropy, extStorage) => {
      const seed = keypairs.generateSeed({
        entropy: Buffer.from(entropy, "hex")
      });
      const keyPair = keypairs.deriveKeypair(seed);
      const address = keypairs.deriveAddress(keyPair.publicKey);
      return extStorage.set("address", address);
    }
  },
  nem: {
    id: "nem",
    name: "NEM",
    component: () => import("../component/nem.js"),
    icon: require("../res/coins/nem.png"),
    scheme: "nem",
    onAdd: (entropy, extStorage) => {
      const seed = bip39.mnemonicToSeed(bip39.entropyToMnemonic(entropy));
      const node = bcLib.HDNode.fromSeedBuffer(seed)
        .deriveHardened(44)
        .deriveHardened(43) //nem coin type
        .deriveHardened(0); //default account
      const address = nem.model.address.toAddress(
        nem.crypto.keyPair
          .create(node.keyPair.d.toBuffer().toString("hex"))
          .publicKey.toString(),
        nem.model.network.data.mainnet.id
      );
      return extStorage.set("address", address);
    }
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    component: () =>
      import("../component/ethBase.js").then(c =>
        c.default({
          networkName: "Ethereum",
          networkScheme: "ethereum",
          networkIcon: require("../res/coins/eth.png"),
          networkSymbol: "ETH",
          bip44DerivationPath: "m/44'/60'/0'/0/0",
          chainId: 1,
          rpcServers: [
            "https://mainnet.infura.io/v3/e68a5c486079484395f5215d9d8ca001",
            "https://os-eth.missmonacoin.org/"
          ],
          explorer: "https://etherscan.io/address/"
        })
      ),
    icon: require("../res/coins/eth.png"),
    scheme: "ethereum",
    onAdd(entropy, extStorage) {
      const seed = bip39.mnemonicToSeed(bip39.entropyToMnemonic(entropy));

      const address = hdkey
        .fromMasterSeed(seed)
        .derivePath("m/44'/60'/0'/0/0")
        .getWallet()
        .getChecksumAddressString();
      return extStorage.set("address", address);
    }
  },
  nekonium: {
    id: "nekonium",
    name: "Nekonium",
    component: () =>
      import("../component/ethBase.js").then(c =>
        c.default({
          networkName: "Nekonium",
          networkScheme: "nekonium",
          networkIcon: require("../res/coins/nuko.png"),
          networkSymbol: "NUKO",
          bip44DerivationPath: "m/44'/299'/0'/0/0",
          chainId: 1,
          rpcServers: [
            "https://www.nekonium.site:8293/",
            "https://ssl.nekonium.site:8293/"
          ],
          explorer: "http://nekonium.network/account/"
        })
      ),
    icon: require("../res/coins/nuko.png"),
    scheme: "nekonium",
    onAdd(entropy, extStorage) {
      const seed = bip39.mnemonicToSeed(bip39.entropyToMnemonic(entropy));

      const address = hdkey
        .fromMasterSeed(seed)
        .derivePath("m/44'/299'/0'/0/0")
        .getWallet()
        .getChecksumAddressString();
      return extStorage.set("address", address);
    }
  },
  etherclassic: {
    id: "etherclassic",
    name: "Ethereum Classic",
    component: () =>
      import("../component/ethBase.js").then(c =>
        c.default({
          networkName: "Ethereum Classic",
          networkScheme: "etherclassic",
          networkIcon: require("../res/coins/etc.png"),
          networkSymbol: "ETC",
          bip44DerivationPath: "m/44'/61'/0'/0/0",
          chainId: 61,
          rpcServers: ["https://www.ethercluster.com/etc"],
          explorer: "http://gastracker.io/addr/"
        })
      ),
    icon: require("../res/coins/etc.png"),
    scheme: "etherclassic",
    onAdd(entropy, extStorage) {
      const seed = bip39.mnemonicToSeed(bip39.entropyToMnemonic(entropy));

      const address = hdkey
        .fromMasterSeed(seed)
        .derivePath("m/44'/61'/0'/0/0")
        .getWallet()
        .getChecksumAddressString();
      return extStorage.set("address", address);
    }
  }
};
exports.get = extId => {
  return extensions[extId];
};

exports.each = fn => {
  for (let extName in extensions) {
    if (extensions[extName] && extensions[extName].id) {
      fn(extensions[extName]);
    }
  }
};

exports.extStorage = extId => ({
  set: (key, data) =>
    storage.get("extData").then(d => {
      if (!d) {
        d = {};
      }
      if (!d[extId]) {
        d[extId] = {};
      }
      d[extId][key] = data;
      storage.set("extData", d);
    }),
  get: key =>
    storage.get("extData").then(d => {
      if (!d) {
        return null;
      }
      if (!d[extId]) {
        return null;
      }
      return d[extId][key];
    })
});
