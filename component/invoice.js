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
const coinUtil = require("../js/coinUtil");

module.exports = require("../js/lang.js")({
  ja: require("./ja/invoice.html"),
  en: require("./en/invoice.html")
})({
  data() {
    return {
      address: "",

      qrDataUrl: "",
      shareable: coinUtil.shareable(),
      edit: false,
      amount: 0,
      message: "",
      addressIndex: 0,
      messageOpRet: "",
      currency: [],
      currencyIndex: 0,
      labels: [coinUtil.DEFAULT_LABEL_NAME],
      fiat: 0,
      price: 0,
      fiatTicker: this.$store.state.fiat,

      orderDlg: false,

      orders: [],
      onOrder: [],

      isAddrUrl: false
    };
  },
  store: require("../js/store.js"),
  methods: {
    copyAddress() {
      coinUtil.copy(this.url);
    },
    generateQR(url) {
      qrcode.toDataURL(
        url || this.url,
        {
          errorCorrectionLevel: "M",
          type: "image/png"
        },
        (err, qurl) => {
          this.qrDataUrl = qurl;
        }
      );
      if (this.currencyIndex !== -1) {
        this.currentCurIcon = currencyList.get(
          this.currency[this.currencyIndex].coinId
        ).icon;
      } else {
        this.currentCurIcon = currencyList.get("mona").icon;
      }
    },
    calcFiat() {
      this.$nextTick(() => {
        this.fiat = Math.ceil(this.amount * this.price * 10000000) / 10000000;
        this.generateQR();
      });
    },
    calcCur() {
      this.$nextTick(() => {
        this.amount = Math.ceil((this.fiat / this.price) * 10000000) / 10000000;
        this.generateQR();
      });
    },
    getPrice() {
      coinUtil.getPrice(this.coinType, this.fiatTicker).then(res => {
        this.price = res;
      });
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
    getLabels() {
      currencyList
        .get(this.currency[this.currencyIndex].coinId)
        .getLabels()
        .then(res => {
          this.$set(this, "labels", res);
        });
    }
  },
  computed: {
    url() {
      if (!this.currency[this.currencyIndex]) {
        return;
      }
      const cur = currencyList.get(this.currency[this.currencyIndex].coinId);
      const url = coinUtil.getBip21(
        cur.bip21,
        cur.getAddress(0, this.addressIndex | 0),
        {
          amount: this.amount,
          label: this.labels[this.addressIndex],
          message: this.message,
          "req-opreturn": this.messageOpRet
        },
        this.isAddrUrl
      );
      this.generateQR(url);
      return url;
    },
    coinType() {
      if (this.currencyIndex === -1) {
        return "mona";
      }
      if (this.currency[this.currencyIndex]) {
        return this.currency[this.currencyIndex].coinId;
      }
      return "";
    },
    total() {
      let total = 0;
      this.onOrder.forEach(i => {
        total += parseFloat(this.orders[i].price);
      });
      return total;
    }
  },
  watch: {
    currencyIndex() {
      this.generateQR();
      if (this.currencyIndex !== -1) {
        this.getLabels();
      }
      this.getPrice();
      this.fiat = 0;
      this.amount = 0;
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
  },
  mounted() {
    storage.get("settings").then(data => {
      if (!data) {
        data = {};
      }
    });
    this.generateQR();
    this.getPrice();
    this.getLabels();

    storage.get("orders").then(r => {
      this.orders = r || [];
    });
  }
});
