require("../scss/index.scss")
require('../dist/onsenui/css/onsenui.css')
require('../dist/onsenui/css/onsen-css-components.css')
//const Vue = require("vue/dist/vue")
//const VueOnsen = require("vue-onsenui")

Vue.use(VueOnsen)

Vue.component('custom-bar', require("../component/customBar.js"))
exports.vm= new Vue({
  el:"#app",
  data(){
    return {}
  },
  components:{
    navigator:require("../component/navigator.js"),
    first:require("../component/first.js")
  },

})
