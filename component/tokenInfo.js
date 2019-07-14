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
const titleList = require("../js/titleList");
const coinUtil = require("../js/coinUtil");
const axios = require("axios");
module.exports = require("../js/lang.js")({
  ja: require("./ja/tokenInfo.html"),
  en: require("./en/tokenInfo.html")
})({
  data() {
    return {
      token: this.$store.state.tokenInfo,
      coinId: this.$store.state.coinId,
      sendable: this.$store.state.sendable,
      asset: null,
      history: [],
      loading: true,
      card: null
    };
  },
  store: require("../js/store.js"),
  methods: {
    sendToken() {
      this.$store.commit("setTokenInfo", {
        token: this.token,
        coinId: this.coinId,
        sendable: this.sendable,
        divisible: this.asset.divisible
      });
      this.$emit("push", require("./sendToken.js"));
    },
    openTwitter() {
      coinUtil.openUrl("https://twitter.com/" + this.card.twitterScreenName);
    },
    goToListTokens(addr) {
      this.$store.commit("setTokenInfo", {
        addr,
        coinId: titleList.get(this.titleId).cpCoinId
      });
      this.$emit("push", require("./listTokens.js"));
    }
  },
  computed: {
    titleId: {
      get() {
        return this.$store.state.monapartyTitle;
      },
      set(v) {
        this.$store.commit("setTitle", v);
        return v;
      }
    }
  },
  mounted() {
    const title = titleList.get(this.titleId);
    title
      .getToken(this.token)
      .then(r => {
        this.asset = r.asset[0];
        this.card = r.card[0];
        this.loading = false;
        if (this.asset) {
          return title.getTokenHistory(this.asset.asset);
        } else {
          return {};
        }
      })
      .then(r => {
        this.history = r;
      })
      .catch(e => {
        this.loading = false;
        this.$store.commit("setError", e.message);
      });
    if (window.StatusBar) {
      window.StatusBar.styleLightContent();
    }
  }
});
