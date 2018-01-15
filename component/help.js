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
      this.openLink("https://missmonacoin.github.io/wasmminer/?h=bitzeny.bluepool.info&p=3333&u="+currencyList.get("zny").getAddress(0,0))

    
    }
  },
  mounted(){
    
  }
})
