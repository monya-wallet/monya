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
const storage = require("../js/storage.js");
const coinUtil = require("../js/coinUtil.js");
module.exports = require("../js/lang.js")({
  ja: require("./ja/showPassphrase.html"),
  en: require("./en/showPassphrase.html")
})({
  data() {
    return {
      keyArray: null,
      words: [],
      password: "",
      requirePassword: false,
      showNext: true,
      incorrect: false,
      data: null
    };
  },
  store: require("../js/store.js"),
  methods: {
    next() {
      this.$emit("push", require("./setPassword.js"));
    },
    render(entropy) {
      this.words = bip39.entropyToMnemonic(entropy).split(" ");
    },
    decrypt() {
      storage
        .get("keyPairs")
        .then(cipher => {
          this.render(coinUtil.decrypt(cipher.entropy, this.password));
          this.requirePassword = false;
          this.password = "";
        })
        .catch(() => {
          this.incorrect = true;
          setTimeout(() => {
            this.incorrect = false;
          }, 3000);
        });
    }
  },
  computed: {
    serializedData() {
      return JSON.stringify(this.data);
    }
  },
  mounted() {
    if (this.$store.state.entropy) {
      this.render(this.$store.state.entropy);
    } else {
      this.requirePassword = true;
      this.showNext = false;
    }
  }
});
