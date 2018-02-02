const storage = require("../js/storage")
module.exports=require("./first.html")({
  data(){
    return {
      popoverVisible:false,
      popoverTarget:false,
      popoverDirection:"up"
    }
  },
  methods:{
    start(){
      this.$emit("push",require("./question.js"))
    },
    changeLang(ln){
      storage.changeLang(ln)
    }
  },
  mounted(){
    if(!navigator.standalone&&!this.$ons.platform.isWebView()){
      this.popoverVisible=true
      if (this.$ons.platform.isAndroid()&&this.$ons.platform.isChrome()) {
        this.popoverTarget=document.getElementById("popoverTargetAndroid")
        this.popoverDirection="down"
      }else if(this.$ons.platform.isIOS()){
        this.popoverTarget=document.getElementById("popoverTarget")
        this.popoverDirection="up"
      }
    }else{
      this.popoverVisible=false
    }
  }
})
