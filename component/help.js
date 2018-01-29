const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
module.exports=require("./help.html")({
  data(){
    return {

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
      const zny=currencyList.get("zny")
      if (zny.hdPubNode) {
        this.openLink("https://missmonacoin.github.io/wasmminer/?h=bitzeny.bluepool.info&p=3333&u="+zny.getAddress(0,0))
      }else{
        this.openLink("https://missmonacoin.github.io/wasmminer/")
      }
    }
  },
  mounted(){
    
  }
})
