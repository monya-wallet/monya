const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("../js/lang.js")({ja:require("./ja/help.html"),en:require("./en/help.html")})({
  data(){
    return {
      question:false
    }
  },
  methods:{
    about(){
      this.$emit("push",require("./about.js"))
    },
    openLink(url){
       coinUtil.openUrl(url)
    },
    mineZeny(){
      
    },
    faucet(){
      storage.get("question").then(r=>{
        let question;
        if(r&&r.length){
          question=r.reduce((acc,v)=>{
            if(typeof(v)==="string"){
              acc+="["+v+"]"
            }else if(typeof(v)==="number"&&0<=v&&v<=15){
              acc+=v.toString(16)
            }else if(typeof(v)==="boolean"){
              acc+=v?"Y":"N"
            }else{
              acc+="X"
            }
            return acc
          },"")
        }else{
          question=""
        }
        coinUtil.openUrl(`https://faucetparty.herokuapp.com?question=${encodeURIComponent(question)}&isNative=${!!coinUtil.isCordovaNative()}`)
      })
    }
  },
  mounted(){
    
  }
})










