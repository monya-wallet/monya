const currencyList = require("../js/currencyList")
module.exports=require("./tokenInfo.html")({
  data(){return{
    token:this.$store.state.tokenInfo,
    coinId:this.$store.state.coinId,
    asset:{},
    history:[],
    loading:true
  }},
  store:require("../js/store.js"),
  mounted(){
    Promise.all([
      currencyList.get(this.coinId).callCP("get_assets_info",{
        assetsList:[this.token]
      }),currencyList.get(this.coinId).callCP("get_asset_history",{
        asset:this.token
      })])
      .then(res=>{
        this.asset=res[0].result[0]
        this.history=res[1].result
        this.loading=false
      }).catch(e=>{
        this.$ons.notification.alert("Error: "+e.message)
      })
  }      
})
