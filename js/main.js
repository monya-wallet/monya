require("../scss/index.scss")
require('../res/onsenui/css/onsenui.min.css')
require('../res/onsenui/css/onsen-css-components.min.css')
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
