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
    if(!navigator.standalone&&!window.cordova){
      if (this.$ons.platform.isAndroid()&&this.$ons.platform.isChrome()) {
        this.popoverTarget=document.getElementById("popoverTargetAndroid")
        this.popoverDirection="down"
        this.popoverVisible=true
      }else if(this.$ons.platform.isIOS()){
        this.popoverTarget=document.getElementById("popoverTarget")
        this.popoverDirection="up"
        this.popoverVisible=true
      }
    }else{
      this.popoverVisible=false
      this.popoverTarget=document.getElementById("popoverTarget")
    }
  }
})
