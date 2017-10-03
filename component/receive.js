const coin = require("../js/coin.js")

module.exports=require("./receive.html")({
  data(){
    return {
      mainAddress:""
    }
  },
  methods:{
    getMainAddress(){
      this.mainAddress=coin.getAddressForTesting()
    }
    
  },
  mounted(){
    this.getMainAddress()
  }
})
