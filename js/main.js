/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 monya-wallet

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
require("../scss/index.scss")
require('onsenui/css/onsenui-core.min.css')
require('onsenui/css/onsen-css-components.min.css')
require('babel-polyfill')
if(!window.cordova){
  require('../res/cordova-plugin-qrscanner-lib.min.js')
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
