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
const coinUtil = require("../js/coinUtil.js");
const currencyList = require("../js/currencyList.js");
const crypto = require("crypto");
const storage = require("../js/storage.js");
const errors = require("../js/errors");
const template = require("../lang/template.json");
const zxcvbn = require("zxcvbn");

const ext = require("../js/extension.js");

// minimum required password score (exclusive)
// change here if you need
const requiredScore = 3;

module.exports = require("../js/lang.js")({
  ja: require("./ja/setPassword.html"),
  en: require("./en/setPassword.html")
})({
  data() {
    return {
      passwordType: "password",
      currentPassword: "",
      password: "",
      password2: "",
      change: false,
      error: false,
      loading: false,
      biometric: true,
      biometricAvailable: false,
      encrypt: false,
      encrypted: false,
      answers: this.$store.state.answers,
      passwordScore: 0
    };
  },
  store: require("../js/store.js"),
  methods: {
    next() {
      if (
        !this.password ||
        this.password !== this.password2 ||
        this.password.length < 6
      ) {
        return;
      }
      if (this.passwordScore < requiredScore) {
        this.$ons.notification.alert(
          `${this.password}は禁止! (${this.passwordScore} < ${requiredScore})`
        );
        return;
      }
      this.loading = true;
      let cipherPromise = null;
      if (this.change) {
        cipherPromise = storage.get("keyPairs").then(cipher =>
          coinUtil.makePairsAndEncrypt({
            entropy: coinUtil.decrypt(cipher.entropy, this.currentPassword),
            password: this.password,
            makeCur: Object.keys(cipher.pubs)
          })
        );
        if (this.encrypt || this.encrypted) {
          // if already encrypted, always encrypt
          storage.setEncryption(this.password);
        }
      } else {
        currencyList.init([]);
        const exts = [];

        if (this.answers[9]) {
          exts.push("zaifPay");
        }

        cipherPromise = storage
          .set("settings", {
            includeUnconfirmedFunds: false,
            useEasyUnit: !!this.answers[8],
            absoluteTime: false,
            fiat: "jpy",
            paySound: false,
            monaparty: {
              bgClass: "sand"
            },
            enabledExts: exts
          })
          .then(() => storage.set("question", this.answers))
          .then(() =>
            coinUtil.makePairsAndEncrypt({
              entropy: this.$store.state.entropy,
              password: this.password,
              makeCur: [template["<!--t:primaryCoinId-->"] || "mona"]
            })
          );
      }
      cipherPromise
        .then(data => storage.set("keyPairs", data))
        .then(() => {
          this.$store.commit("deleteEntropy");
          this.$store.commit("setFinishNextPage", {
            page: require("./login.js"),
            infoId: "createdWallet"
          });
          this.$emit("replace", require("./finished.js"));
          if (this.biometric) {
            return storage.setBiometricPassword(this.password);
          }
        })
        .catch(e => {
          if (!(e instanceof errors.BiometricError)) {
            this.error = e.message || true;
            this.loading = false;
          }
        });
    }
  },
  watch: {
    password(p) {
      this.passwordScore = zxcvbn(p).score;
    }
  },
  created() {
    if (this.$store.state.entropy) {
      this.change = false;
    } else {
      this.change = true;
    }
    storage.isBiometricAvailable().then(flag => {
      this.biometricAvailable = flag;
      this.biometric = flag;
    });
    storage.dataState().then(flag => {
      if (flag === 2) {
        this.encrypted = true;
        this.encrypt = true;
      }
    });
  }
});
