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
const qrcode = require("qrcode");
const currencyList = require("../js/currencyList");
const storage = require("../js/storage");
const Currency = require("../js/currency");
const coinUtil = require("../js/coinUtil");

module.exports = require("../js/lang.js")({
  ja: require("./ja/receive.html"),
  en: require("./en/receive.html")
})({
  data() {
    return {
      mainAddress: "",
      qrDataUrl: "",
      currentCurIcon: "",
      shareable: coinUtil.shareable(),
      currency: [],
      currencyIndex: 0,
      labels: [coinUtil.DEFAULT_LABEL_NAME],
      dialogVisible: false,
      labelInput: "",
      maxLabel: coinUtil.GAP_LIMIT,
      state: "initial",
      changeBalance: 0
    };
  },
  store: require("../js/store.js"),
  methods: {
    getMainAddress() {
      const cur = currencyList.get(this.currency[this.currencyIndex].coinId);
      this.mainAddress = cur.getAddress(0, 0);
      qrcode.toDataURL(
        cur.bip21 + ":" + this.mainAddress,
        {
          errorCorrectionLevel: "M",
          type: "image/png"
        },
        (err, url) => {
          this.qrDataUrl = url;
        }
      );

      this.currentCurIcon = cur.icon;
    },
    atomicswap() {
      this.$emit("push", require("./atomicswap.js"));
    },
    copyAddress() {
      coinUtil.copy(this.mainAddress);
    },
    getLabels() {
      currencyList
        .get(this.currency[this.currencyIndex].coinId)
        .getLabels()
        .then(res => {
          this.$set(this, "labels", res);
        })
        .catch(e => {
          this.$store.commit("setError", e.message);
        });
    },
    qr() {
      this.$emit("push", require("./qrcode.js"));
    },
    createLabel() {
      if (!this.labelInput) {
        return;
      }
      this.dialogVisible = false;
      const cId = this.currency[this.currencyIndex].coinId;
      const derivation = this.labelInput.split("/");
      if (derivation.length === 3 && derivation[0] === "derive") {
        this.showLabel(cId, null, derivation[1] | 0, derivation[2] | 0);
        this.labelInput = "";
      } else {
        currencyList
          .get(cId)
          .createLabel(this.labelInput)
          .then(() => {
            this.labelInput = "";
            this.getLabels();
          })
          .catch(e => {
            this.$store.commit("setError", e.message);
          });
      }
    },
    showLabel(coinId, name, change, index) {
      this.$store.commit("setLabelToShow", { coinId, name, index, change });
      this.$emit("push", require("./showLabel.js"));
    },
    createInvoice() {
      this.$emit("push", require("./invoice.js"));
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
            message: this.mainAddress
          },
          targetBounds
        )
        .then(() => {})
        .catch(() => {
          this.copyAddress();
        });
    },
    getChangeBalance() {
      const coinId = this.currency[this.currencyIndex].coinId;
      const cur = currencyList.get(coinId);
      cur.getChangeBalance(false, false).then(v => {
        this.changeBalance = v.balance;
      });
    }
  },
  watch: {
    currencyIndex() {
      this.getMainAddress();
      this.getLabels();
      this.getChangeBalance();
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
    this.getMainAddress();
    this.getLabels();
    this.getChangeBalance();
  }
});
