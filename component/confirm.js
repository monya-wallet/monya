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
const storage = require("../js/storage.js");
const coinUtil = require("../js/coinUtil");
const currencyList = require("../js/currencyList");
const bcLib = require("bitcoinjs-lib");
const errors = require("../js/errors");
const BigNumber = require("bignumber.js");
module.exports = require("../js/lang.js")({
  ja: require("./ja/confirm.html"),
  en: require("./en/confirm.html")
})({
  data() {
    return {
      address: "",
      amount: "",
      fiat: "",
      feePerByte: 0,
      fee: 0,
      destHasUsed: false,
      message: "",
      myBalanceBeforeSending: 0,
      utxosToShow: null,
      signedHex: null,
      coinType: "",
      utxoStr: "",
      ready: false,
      txb: null,
      addressPath: null,
      password: "",
      cur: null,
      insufficientFund: false,
      loading: true,
      incorrect: false,
      paySound: false,
      hash: "",
      sendNegative: false
    };
  },
  store: require("../js/store.js"),
  mounted() {
    [
      "address",
      "amount",
      "fiat",
      "feePerByte",
      "message",
      "coinType",
      "txLabel",
      "utxoStr",
      "signOnly"
    ].forEach(v => {
      this[v] = this.$store.state.confPayload[v];
    });
    this.sendNegative = +this.amount < 0;
    this.cur = currencyList.get(this.coinType);
    this.$nextTick(this.build);
    currencyList
      .get(this.coinType)
      .getAddressProp("totalReceived", this.address)
      .then(res => {
        if (res | 0) {
          this.destHasUsed = true;
        }
      });
  },
  computed: {
    afterSent() {
      return new BigNumber(this.myBalanceBeforeSending)
        .minus(parseFloat(this.amount) || 0)
        .minus(this.fee)
        .toNumber();
    },
    utxosJson() {
      return JSON.stringify(this.utxosToShow);
    }
  },
  methods: {
    async next() {
      try {
        this.loading = true;
        const cur = this.cur;

        this.ready = false;
        const cipher = await storage.get("keyPairs");
        await coinUtil.shortWait();
        const finalTx = cur.signTx({
          entropyCipher: cipher.entropy,
          password: this.password,
          txBuilder: this.txb,
          path: this.path
        });
        this.hash = finalTx.toHex();
        if (this.signOnly) {
          throw new errors.SignOnly();
        }
        const res = await cur.pushTx(this.hash);
        cur.saveTxLabel(res.txid, {
          label: this.txLabel,
          price: parseFloat(this.price)
        });
        if (cur.sound && this.paySound) {
          new Audio(cur.sound).play();
        }
        this.$store.commit("setFinishNextPage", {
          infoId: "sent",
          payload: {
            txId: res.txid,
            coinId: this.coinType
          }
        });
        this.$emit("pop");
        this.$emit("pop");
        this.$emit("push", require("./finished.js"));
      } catch (e) {
        this.loading = false;
        if (e.request) {
          this.$store.commit(
            "setError",
            e.request.responseText || "Network Error.Please try again"
          );
        } else if (e instanceof errors.PasswordFailureError) {
          this.incorrect = true;
          this.ready = true;
          setTimeout(() => {
            this.incorrect = false;
          }, 3000);
        } else if (e instanceof errors.SignOnly) {
          this.ready = true;
        } else {
          this.$store.commit("setError", e.message);
        }
      }
    },
    requestBiometric() {
      storage
        .verifyBiometric()
        .then(pwd => {
          this.password = pwd;
        })
        .catch(() => {
          return true;
        });
    },
    build() {
      const cur = this.cur;
      const split = +this.amount < 0;
      const targets = [];
      if (split) {
        targets.push({
          address: this.address
        });
      } else {
        targets.push({
          address: this.address,
          value: new BigNumber(this.amount)
            .times(100000000)
            .round()
            .toNumber()
        });
      }
      if (this.message) {
        targets.push({
          address: bcLib.script.nullData.output.encode(
            Buffer.from(this.message, "utf8")
          ),
          value: 0
        });
      }
      storage
        .get("settings")
        .then(data => {
          this.paySound = data.paySound;
          return cur.buildTransaction({
            targets,
            split,
            feeRate: this.feePerByte,
            includeUnconfirmedFunds: data.includeUnconfirmedFunds,
            utxoStr: this.utxoStr
          });
        })
        .then(d => {
          if (split) {
            this.amount = new BigNumber(d.outputs[0].value).div(100000000);
          }
          this.fee = new BigNumber(d.fee).div(100000000);
          this.utxosToShow = d.utxos;
          this.path = d.path;
          this.myBalanceBeforeSending = d.balance;
          this.txb = d.txBuilder;
          this.ready = true;
          this.loading = false;
          this.requestBiometric();
          return coinUtil.getPrice(cur.coinId, this.$store.state.fiat);
        })
        .then(price => {
          this.price = price;
          if (split) {
            this.fiat = new BigNumber(this.amount).times(price);
          }
        })
        .catch(e => {
          this.ready = false;
          this.loading = false;
          if (e instanceof errors.NoSolutionError) {
            this.insufficientFund = true;
          } else {
            this.$store.commit("setError", e.message);
          }
        });
    }
  }
});
