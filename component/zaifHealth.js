const axios = require("axios")
const coinUtil = require("../js/coinUtil")
const crypto = require("crypto")

const icons=[
  require("../res/zaifHealth/1.png"),
  require("../res/zaifHealth/2.png"),
    require("../res/zaifHealth/3.png")
]

module.exports=require("../js/lang.js")({ja:require("./ja/zaifHealth.html"),en:require("./en/zaifHealth.html")})({
  data:()=>({
    score:0,
    icon:""
  }),
  mounted(){
    axios.get("https://zaif-status.herokuapp.com/zaif/status").then(res=>{
      const r = res.data
      if (r.connectivity&&r.connectCount<5) {
        this.score=(r.chat*0.2+r.clicks*0.3)|0
      }else{
        this.score=500000000000000
      }

      if(this.score<100){
        this.icon=icons[0]
      }else if(this.score<10000){
        this.icon=icons[1]
      }else{
        this.icon=icons[2]
      }
      
    })
  }
})
