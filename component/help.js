const currencyList = require("../js/currencyList")
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
       window.open(url,this.$store.state.openInAppBrowser?"_blank":"_system")
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
