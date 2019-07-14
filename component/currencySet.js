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
const lang = require("../js/lang.js");

const easyCurTable = {
  jpy: {
    en: "Yen",
    ja: "円"
  },
  usd: {
    en: "ドル",
    ja: "Dollar"
  },
  nyaan: {
    en: "Nyaan",
    ja: "にゃーん"
  }
};

module.exports = lang({
  ja: require("./ja/currencySet.html"),
  en: require("./en/currencySet.html")
})({
  data() {
    return {};
  },
  props: ["amount", "notKnown", "ticker", "about", "fiatTicker"],
  methods: {
    getTicker(t) {
      if (!t) {
        return "";
      }
      if (this.notKnown) {
        return t;
      }
      if (t === "jpy") {
        return this.easy ? easyCurTable.jpy[lang.getLang()] : "JPY";
      }
      if (t === "usd") {
        return this.easy ? easyCurTable.usd[lang.getLang()] : "USD";
      }
      if (t === "nyaan") {
        return easyCurTable.nyaan[lang.getLang()];
      }
      if (t === "satByte") {
        return "sat/B";
      }
      return this.easy
        ? currencyList.get(t).unitEasy
        : currencyList.get(t).unit;
    }
  },
  store: require("../js/store.js"),
  computed: {
    tickerCap() {
      if (this.fiatTicker) {
        return (
          this.getTicker(this.fiatTicker) + "=1" + this.getTicker(this.ticker)
        );
      } else {
        return this.getTicker(this.ticker);
      }
    },
    compAmt() {
      return isNaN(parseFloat(this.amount))
        ? ""
        : (this.amount + "").slice(0, 14);
    },
    easy() {
      return this.$store.state.easyUnit;
    }
  }
});
