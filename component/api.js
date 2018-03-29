const coinUtil = require("../js/coinUtil.js")
const storage = require("../js/storage.js")

module.exports=require("../js/lang.js")({ja:require("./ja/api.html"),en:require("./en/api.html")})({
  data(){
    return {
      name:this.$store.state.apiName,
      param:this.$store.state.param,

      qType:"none",

      password:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    yes(){
      switch(this.name){
        case "enableExtendedMode":
          storage.set("extendedMode",true)
          this.$emit("pop")
          break;
        case "disableExtendedMode":
          storage.set("extendedMode",false)
          this.$emit("pop")
          break;
          
          
      }
    },
    goWithPassword(){
      switch(this.name){
        case "signTx":
          this.$ons.notification.alert(this.password)
          break;
          
          
      }
    },
    no(){
      this.$emit("pop")
    }
  },
  computed:{
    
  },
  mounted(){
    switch(this.name){
      case "enableExtendedMode":
      case "disableExtendedMode":
        this.qType="yOrN"
        break;
      case "signTx":
        this.qType="password"
        break
      case "shareSwapData":
        this.qType="direct"
        this.$emit("pop")
        this.$emit("push",require("./atomicswap.js"))
        break;
      default:
        this.qType="none"
    }
  }
})
