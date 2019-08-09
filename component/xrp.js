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
const bip39 = require("@missmonacoin/bip39-eng");
const coinUtil = require("../js/coinUtil");
const storage = require("../js/storage");
const bcLib = require("bitcoinjs-lib");
const qrcode = require("qrcode");
const { RippleAPI } = require("ripple-lib");
const keypairs = require("ripple-keypairs");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const extension = require("../js/extension.js");
const errors = require("../js/errors.js");

module.exports = require("../js/lang.js")({
  ja: require("./ja/xrp.html"),
  en: require("./en/xrp.html")
})({
  data() {
    return {
      sendAmount: 0,
      sendAddress: "",
      fiatConv: 0,
      password: "",
      address: "",
      qrDataUrl: "",
      shareable: coinUtil.shareable(),
      incorrect: false,
      requirePassword: true,
      api: null,
      connected: false,
      loading: false,
      plzActivate: false,
      balances: null,
      keyPair: null,
      sent: false,
      histError: false,
      history: null,
      memo: "",
      destTag: 0,
      server: "wss://s2.ripple.com:443", //wss://s.altnet.rippletest.net:51233
      confirm: false,
      price: 1,
      serverDlg: false,
      invAmt: ""
    };
  },
  store: require("../js/store.js"),
  methods: {
    getBalance() {
      if (!this.address || !this.connected) {
        return;
      }
      this.loading = true;
      this.api
        .getBalances(this.address)
        .then(b => {
          this.$set(this, "balances", b);
          this.loading = false;
          return this.api.getTransactions(this.address, {
            minLedgerVersion: 7400000
          });
        })
        .then(h => {
          this.$set(
            this,
            "history",
            h.map(v => {
              let ret = {
                type: "unknown" //default is unknown
              };
              if (v.specification.source) {
                if (v.specification.source.address === this.address) {
                  ret.type = "send";
                } else if (
                  v.specification.destination.address === this.address
                ) {
                  ret.type = "receive";
                }
                ret.srcAddr = v.specification.source.address;
                ret.destAddr = v.specification.destination.address;
                ret.balanceChange = v.outcome.balanceChanges[this.address];
              }
              return ret;
            })
          );
          this.plzActivate = false;
        })
        .catch(e => {
          this.loading = false;
          if (e.message === "actNotFound") {
            this.plzActivate = true;
            return;
          }
          this.$store.commit("setError", e.message);
        });
    },
    copyAddress() {
      coinUtil.copy(this.address);
    },
    share(event) {
      const targetRect = event.target.getBoundingClientRect(),
        targetBounds =
          targetRect.left +
          "," +
          targetRect.top +
          "," +
          targetRect.width +
          "," +
          targetRect.height;
      coinUtil
        .share(
          {
            url: this.url
          },
          targetBounds
        )
        .then(() => {})
        .catch(() => {
          this.copyAddress();
        });
    },
    send() {
      this.confirm = false;
      this.loading = true;
      const sendDrops = Math.floor(parseFloat(this.sendAmount) * 1000000);
      const payment = {
        source: {
          address: this.address,
          maxAmount: {
            value: (sendDrops / 1000000).toString(),
            currency: "XRP"
          }
        },
        destination: {
          address: this.sendAddress,
          amount: {
            value: (sendDrops / 1000000).toString(),
            currency: "XRP"
          },
          tag: this.destTag | 0
        },
        memos: [{ data: this.memo }]
      };
      Promise.all([
        this.api.preparePayment(this.address, payment, {
          maxLedgerVersionOffset: 5
        }),
        storage.get("keyPairs")
      ])
        .then(p => {
          const seed = keypairs.generateSeed({
            entropy: Buffer.from(
              coinUtil.decrypt(p[1].entropy, this.password),
              "hex"
            )
          });
          const signedData = this.api.sign(p[0].txJSON, seed);
          return this.api.submit(signedData.signedTransaction);
        })
        .then(m => {
          this.loading = false;
          if (m.resultCode === "tesSUCCESS") {
            this.sendAddress = "";
            this.sendAmount = 0;
            this.memo = "";
            this.destTag = 0;
            this.$store.commit("setFinishNextPage", {
              page: require("./home.js"),
              infoId: "sent",
              payload: {
                txId: ""
              }
            });
            this.$emit("replace", require("./finished.js"));
          } else {
            this.$store.commit(
              "setError",
              m.resultCode + ":" + m.resultMessage
            );
          }
        })
        .catch(e => {
          this.loading = false;
          this.$store.commit("setError", e.message);
        });
    },
    connect() {
      this.loading = true;
      this.serverDlg = false;
      this.api = new RippleAPI({
        server: this.server || "wss://s2.ripple.com:443"
      });
      this.api
        .connect()
        .then(() => {
          this.connected = true;
          this.loading = false;
          this.getBalance();
        })
        .catch(e => {
          this.loading = false;

          this.$store.commit("setError", e.message);
        });
      this.api.on("error", (code, msg, data) => {
        this.$store.commit("setError", code + ":" + msg);
      });
    },
    getPrice() {
      axios({
        url: "https://public.bitbank.cc/xrp_jpy/ticker",
        method: "GET"
      })
        .then(res => {
          this.price = res.data.data.last;
          return coinUtil.getPrice("jpy", this.$store.state.fiat);
        })
        .then(p => {
          this.price *= p;
        })
        .catch(() => {
          this.price = 1;
        });
    },
    getQrCode() {
      qrcode.toDataURL(
        this.url,
        {
          errorCorrectionLevel: "M",
          type: "image/png"
        },
        (err, url) => {
          this.qrDataUrl = url;
        }
      );
    }
  },
  computed: {
    url() {
      return coinUtil.getBip21(
        "ripple",
        this.address,
        {
          amount: parseFloat(this.invAmt),
          label: this.invMosaic
        },
        this.addressFormat === "url"
      );
    }
  },
  watch: {
    fiatConv(v) {
      this.sendAmount = parseFloat(v) / this.price;
    },
    sendAmount(v) {
      this.fiatConv = parseFloat(v) * this.price;
    },
    invAmt() {
      this.getQrCode();
    }
  },
  mounted() {
    const rSend = this.$store.state.extensionSend || {};
    const sa = parseFloat(rSend.amount) || 0;
    if (rSend.address) {
      this.sendAddress = rSend.address;
      this.sendAmount = sa;
    }
    this.$store.commit("setExtensionSend", {});
    this.connect();
    this.getPrice();
    const ext = extension.extStorage("xrp");
    ext.get("address").then(address => {
      if (!address) {
        this.$emit("push", {
          extends: require("./manageCoin.js"),
          data() {
            return { requirePassword: true };
          }
        });
        return;
      }
      this.address = address;
      this.getBalance();
      this.getQrCode();
      if (this.sendAddress) {
        this.sendMenu = true;
      }
    });
  }
});
