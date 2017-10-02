require("../scss/index.scss")
require('onsenui/css/onsenui.css')
require('onsenui/css/onsen-css-components.css')
//const Vue = require("vue/dist/vue")
//const VueOnsen = require("vue-onsenui")

Vue.use(VueOnsen)

Vue.component('custom-bar', require("../component/customBar.js"))

const vm=window.vm = exports.vm= new Vue({
  el:"#app",
  data(){
    return {}
  },
  components:{
    navigator:require("../component/navigator.js")
  },

})
