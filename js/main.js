require("../scss/index.scss")
require('../dist/onsenui/css/onsenui.css')
require('../dist/onsenui/css/onsen-css-components.css')
//const Vue = require("vue/dist/vue")
//const VueOnsen = require("vue-onsenui")
const Vuex = require("vuex")

Vue.use(VueOnsen)
Vue.use(Vuex)

Vue.component('custom-bar', require("../component/customBar.js"))
Vue.component('currency-set', require("../component/currencySet.js"))
exports.vm= new Vue({
  el:"#app",
  data(){
    return {}
  },
  components:{
    navigator:require("../component/navigator.js")
  }
})
