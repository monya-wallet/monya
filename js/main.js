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
require("../scss/index.scss")
require('onsenui/css/onsenui-core.min.css')
require('onsenui/css/onsen-css-components.min.css')
require('babel-polyfill')
if(!window.cordova){
  window.QRScanner = require('../res/cordova-plugin-qrscanner-lib.min.js')
}
const Vue = require("vue/dist/vue.runtime.min")
const VueOnsen = require('vue-onsenui')
const Vuex = require("vuex")
const template = require("../lang/template.json")


Vue.use(VueOnsen)
Vue.use(Vuex)

Vue.component('custom-bar', require("../component/customBar.js"))
Vue.component('currency-set', require("../component/currencySet.js"))
Vue.component('timestamp', require("../component/timestamp.js"))
const coinUtil=require("../js/coinUtil") // can conflict
Vue.directive('focus', {
  inserted: function (el,binding) {
    el.focus()
  }
})
exports.vm= new Vue({
  el:"#app",
  render(h){
    return h("navigator")
  },
  data(){
    return {}
  },
  components:{
    navigator:require("../component/navigator.js")
  },
  store:require("../js/store.js"),
  beforeMount() {
    document.title = template["<!--t:AppName-->"]
    
    if(this.$ons.platform.isAndroid()&&window.StatusBar){
       window.StatusBar.styleLightContent()
    }
    if(coinUtil.isElectron() && window.process.platform==="darwin"){
      const elem=document.createElement("div")
      elem.className="ons-status-bar-mock ios"
      elem.style.webkitAppRegion="drag"
      document.body.insertBefore(elem, document.body.firstChild)
    }
    this.$ons.enableAutoStatusBarFill()
    const html = document.documentElement;
    if (this.$ons.platform.isIPhoneX()) {
      if(window.cordova){
        html.setAttribute('onsflag-iphonex-portrait', '');
      }
      html.setAttribute('onsflag-iphonex-landscape', '');
    }

    document.getElementById("cover").style.display="none"
  }
})
if ('serviceWorker' in navigator&&!window.cordova&&!coinUtil.isElectron()) {
  navigator.serviceWorker.register('/sw.js').then(()=>true).catch(()=>true);
}

window.handleOpenURL=function(url) {
  coinUtil.queueUrl(url)
}
const kvs=location.search.slice(1).split("&")
for (let i = 0; i < kvs.length; i++) {
  const kv=kvs[i].split("=")
  if(kv[0]==="url"){
    coinUtil.queueUrl(decodeURIComponent(kv[1]))
    break;
  }
}
