const storage = require("../js/storage")
module.exports=require("../js/lang.js")({ja:require("./ja/first.html"),en:require("./en/first.html")})({
  data(){
    return {
      popoverVisible:false,
      popoverTarget:false,
      popoverDirection:"up",
      howTo:false,
      showAlert:false
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
      if(this.$ons.platform.isIOS()){
        this.popoverTarget=document.getElementById("popoverTarget")
        this.popoverDirection="up"
        this.popoverVisible=true
      }
    }else{
      this.popoverTarget=false
      this.popoverVisible=false
    }

    this.showAlert=/line/i.test(navigator.userAgent)
  }
})
