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
module.exports = require("../js/lang.js")({
  ja: require("./ja/restorePassphrase.html"),
  en: require("./en/restorePassphrase.html")
})({
  data() {
    return {
      keyArray: null,
      words: [
        {
          word: ""
        }
      ],
      suggestion: [],
      noMatch: false,
      deleteFlag: false,
      lastWdCnt: 0,
      error: false
    };
  },
  store: require("../js/store.js"),
  methods: {
    next() {
      try {
        this.remove(this.words.length - 1);
        const mnemonic = this.words.reduce((p, v) => {
          return (p ? p + " " : "") + v.word;
        }, null);
        this.$store.commit("setEntropy", bip39.mnemonicToEntropy(mnemonic));
        this.$emit("push", require("./setPassword.js"));
      } catch (e) {
        this.error = true;
      }
    },
    addWord() {
      this.words.push({
        word: ""
      });
      this.suggestion = [];
    },
    input() {
      const wd = this.words[this.words.length - 1];
      if (this.lastWdCnt < wd.word.length) {
        this.insert();
      }
      this.lastWdCnt = wd.word.length;
    },
    insert() {
      const wd = this.words[this.words.length - 1];
      const suggest = this.suggest(wd.word);
      if (suggest.length === 1) {
        if (suggest[0] === wd.word) {
          wd.word = suggest[0];
          this.addWord();
        }
        this.noMatch = false;
      } else if (suggest.length === 0) {
        this.noMatch = true;
      } else {
        this.suggestion = suggest;
        this.noMatch = false;
      }
    },
    remove(i) {
      if (this.wdLength !== 1) {
        this.words.splice(i, 1);
      }
      this.deleteFlag = false;
      this.suggestion = [];
    },
    removeEvt() {
      const index = this.words.length - 1;
      this.noMatch = false;
      if (!this.words[index].word && index !== 0) {
        if (this.deleteFlag) {
          this.remove(index);
        } else {
          this.deleteFlag = true;
        }
      }
    },
    reset() {
      this.words = [
        {
          word: ""
        }
      ];
    },
    apply(s) {
      this.words[this.words.length - 1].word = s;
      this.addWord();
      this.suggestion = [];
    },
    suggest(word) {
      const ret = [];
      const q = bip39.wordlists.english;
      for (let i = 0; i < q.length && ret.length < 4; i++) {
        if (q[i].startsWith(word)) {
          ret.push(q[i]);
        }
      }
      return ret;
    }
  },
  computed: {
    wdLength() {
      return this.words.length;
    }
  }
});
