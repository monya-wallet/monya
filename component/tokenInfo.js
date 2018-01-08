const currencyList = require("../js/currencyList")
const axios = require("axios")
module.exports=require("./tokenInfo.html")({
  data(){return{
    token:this.$store.state.tokenInfo,
    coinId:this.$store.state.coinId,
    asset:null,
    history:[],
    loading:true,
    card:null
  }},
  store:require("../js/store.js"),
  methods:{
    sendToken(){
      this.$emit("push",require("./sendToken.js"))
    }
  },
  mounted(){
    const promises=[
      currencyList.get(this.coinId).callCP("get_assets_info",{
        assetsList:[this.token]
      }),currencyList.get(this.coinId).callCP("get_asset_history",{
        asset:this.token
      })]
    Promise.all(promises)
      .then(res=>{
        this.asset=res[0].result[0]
        this.history=res[1].result
        this.loading=false
        if(this.coinId==="mona"){
          return axios.get("http://card.mona.jp/api/card_detail.php?assets="+this.asset.asset_longname||this.asset.asset)
        }
      }).then(r=>{
        if(r.data&&r.data.details){
          this.card=r.data.details[0]
        }
      }).catch(e=>{
        this.$ons.notification.alert("Error: "+e.message)
      })
  }      
})
