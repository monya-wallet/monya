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
const currencyList = require("../js/currencyList");
const storage = require("../js/storage");
const coinUtil = require("../js/coinUtil");

const bs58check = require("bs58check");

module.exports = require("../js/lang.js")({
  ja: require("./ja/sweep.html"),
  en: require("./en/sweep.html")
})({
  data() {
    return {
      currency: [],
      currencyIndex: 0,
      address: "",
      queries: [{ private: "", loose: false }],
      feeRate: 0,
      details: false
    };
  },
  store: require("../js/store.js"),
  methods: {
    send() {
      if (this.queries.length === 0 || !this.feeRate) {
        return;
      }
      const cur = currencyList.get(this.currency[this.currencyIndex].coinId);
      const loose = this.queries.some(a => a.loose);
      const keys = this.queries.map(a => a.private);
      try {
        cur
          .sweep(keys, this.address, this.feeRate, loose)
          .then(res => {
            cur.saveTxLabel(res.txid, {
              label: this.txLabel,
              price: parseFloat(this.price)
            });
            this.$store.commit("setFinishNextPage", {
              page: require("./home.js"),
              infoId: "sent",
              payload: {
                txId: res.txid,
                coinId: this.currency[this.currencyIndex].coinId
              }
            });
            this.$emit("replace", require("./finished.js"));
          })
          .catch(e => {
            this.$store.commit("setError", e.message);
          });
      } catch (e) {
        this.$store.commit("setError", "Invalid private key or address");
      }
    },
    getDefaultAddress() {
      this.address = currencyList
        .get(this.currency[this.currencyIndex].coinId)
        .getAddress(0, 0);
    },
    addPrivate() {
      this.queries.push({ private: "", loose: false });
    },
    removePrivate(idx) {
      this.queries.splice(idx, 1);
    },
    wifAddr(idx) {
      let priv = this.queries[idx].private;
      if (!priv) {
        return "";
      }
      try {
        const cur = currencyList.get(this.currency[this.currencyIndex].coinId);

        if (this.queries[idx].loose) {
          const orig = bs58check.decode(priv);
          const hash = orig.slice(1);
          const version = cur.network.wif;
          const payload = Buffer.allocUnsafe(orig.length);
          payload.writeUInt8(version, 0);
          hash.copy(payload, 1);
          priv = bs58check.encode(payload);
        }
        const keyPair = cur.lib.ECPair.fromWIF(priv, cur.network);
        return keyPair.getAddress();
      } catch (e) {
        return "";
      }
    },
    getElementModifier(idx, element) {
      /*
        Priv Details Bottom
        F    F       0
        T    F       2
        F    T       1
        T    T       2
      */
      switch (element) {
        case 0:
          if (!this.wifAddr(idx) && !this.details) {
            return "";
          }
          return "nodivider";
        case 1:
          if (!this.wifAddr(idx) && this.details) {
            return "small";
          }
          return "small nodivider";
        case 2:
          if (this.wifAddr(idx)) {
            return "";
          }
          return "nodivider";
      }
    }
  },
  watch: {
    currencyIndex() {
      this.feeRate = currencyList.get(
        this.currency[this.currencyIndex].coinId
      ).defaultFeeSatPerByte;
    }
  },
  created() {
    currencyList.eachWithPub(cur => {
      this.currency.push({
        coinId: cur.coinId,
        icon: cur.icon,
        name: cur.coinScreenName
      });
    });
  }
});
