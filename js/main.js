require("../scss/index.scss")
require('../dist/onsenui/css/onsenui.css')
require('../dist/onsenui/css/onsen-css-components.css')
const Vue = require("vue/dist/vue.runtime.min")
//const VueOnsen = require("vue-onsenui")
const Vuex = require("vuex")


Vue.use(VueOnsen)
Vue.use(Vuex)

Vue.component('custom-bar', require("../component/customBar.js"))
Vue.component('currency-set', require("../component/currencySet.js"))
Vue.component('timestamp', require("../component/timestamp.js"))

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
    const html = document.documentElement;
    if (this.$ons.platform.isIPhoneX()) {
      html.setAttribute('onsflag-iphonex-portrait', '');
      html.setAttribute('onsflag-iphonex-landscape', '');
    }
    
  }
})
const coinUtil=require("../js/coinUtil")
window.handleOpenURL=function(url) {
  coinUtil.queueUrl(url)
}
