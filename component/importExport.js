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
const storage = require("../js/storage");
const coinUtil = require("../js/coinUtil");
module.exports = require("../js/lang.js")({
  ja: require("./ja/importExport.html"),
  en: require("./en/importExport.html")
})({
  data: () => ({
    expJson: "",
    impJson: "",
    confirm: false,
    resetDialog: false,
    resetDialogConfirm: false,
    loading: false,
    resetCur: false
  }),
  mounted() {
    storage.getAll().then(r => {
      this.expJson = JSON.stringify(r);
    });
  },
  methods: {
    save() {
      this.confirm = false;
      if (!this.impJson) {
        return;
      }
      storage.setAll(JSON.parse(this.impJson)).then(() => {
        window.location.reload();
      });
    },
    reset() {
      storage.erase().then(() => {
        this.$store.commit("deleteEntropy");
        this.$store.commit("setKeyPairsExistence", false);
        this.$store.commit("setFinishNextPage", {
          page: require("./first.js"),
          infoId: "reset"
        });
        this.$emit("replace", require("./finished.js"));
      });
    },
    resetCoins() {
      this.resetCur = false;
      return storage
        .set("customCoins", [])
        .then(() => {
          return storage.set("customTitles", []);
        })
        .then(() => {
          window.location.reload();
        });
    },
    regenerateAddress() {
      this.loading = true;
      coinUtil
        .shortWait()
        .then(() => storage.set("addresses", {}))
        .then(() => {
          this.$emit("replace", require("./login.js"));
        })
        .catch(() => {
          this.loading = false;
        });
    },
    copy() {
      coinUtil.copy(this.expJson);
    }
  }
});
