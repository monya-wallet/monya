module.exports=require("../js/lang.js")({ja:require("./ja/generateKeyWarn.html"),en:require("./en/generateKeyWarn.html")})({
  data(){
    return {
      check1:false,check2:false,check3:false
    }
  },
  methods:{
    next(){
      this.$emit("push",require("./generateKey.js"))
    }
  }
})
