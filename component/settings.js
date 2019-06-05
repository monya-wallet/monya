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
const storage=require("../js/storage")
const currencyList = require("../js/currencyList")
const lang = require("../js/lang.js")
const ext = require("../js/extension.js")

module.exports=lang({ja:require("./ja/settings.html"),en:require("./en/settings.html")})({
  data(){
    return {
      isWebView:false,
      d:{
        includeUnconfirmedFunds:false,
        useEasyUnit:false,
        absoluteTime:false,
        fiat:"jpy",
        paySound:false,
        monaparty:{
          enabled:true,
          bgClass:"sand"
        },
        enabledExts:[]
      },
      monapartyTitleList:currencyList.monapartyTitle,
      lang:"ja",
      extensions:[]
    }
  },
  methods:{
    goToShowPassphrase(){
      this.$emit("push",require("./showPassphrase.js"))
    },
    goToSweep(){
      this.$emit("push",require("./sweep.js"))
    },
    goToEditOrder(){
      this.$emit("push",require("./editOrder.js"))
    },
    goToSign(){
      this.$emit("push",require("./sign.js"))
    },
    goToSignTx(){
      this.$emit("push",require("./signTx.js"))
    },
    goToSetPassword(){
      this.$emit("push",require("./setPassword.js"))
    },
    goToManageCoin(){
      this.$emit("push",require("./manageCoin.js"))
    },
    goToImportExport(){
      this.$emit("push",require("./importExport.js"))
    },
    save(){
      this.$nextTick(()=>{
        storage.set("settings",this.d)
        this.$store.commit("setSettings",this.d)
      })
    },
    changeLang(){
      storage.changeLang(this.lang)
    }
  },
  mounted(){
    this.isWebView=this.$ons.isWebView()
    storage.get("settings").then(d=>{
      Object.assign(this.d,d)
      this.lang=lang.getLang()
    })
  }
})
