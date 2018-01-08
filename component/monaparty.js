const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")
const axios = require("axios")

const COIN_ID="mona"

module.exports=require("./monaparty.html")({
  data:()=>({
    method:"",
    paramsJson:"",
    assets:[],
    search:[],
    searchAddr:"",
    assetName:"",
    loading:false,
    showSearch:false
  }),
  store:require("../js/store.js"),
  methods:{
    send(){
      currencyList.get(COIN_ID).callCP(this.method,JSON.parse(this.paramsJson)).then(res=>{
        console.log(res)
      })
    },
    getMyAssets(){
      this.loading=true
      const cur = currencyList.get(COIN_ID)
      storage.get("addresses").then(r=>cur.callCP("get_normalized_balances",{
        addresses:cur.getReceiveAddr()
      }))
        .then(res=>{
          this.assets=res.result
          this.loading=false
          return axios.get(currencyList.monapartyTitle[this.$store.state.monapartyTitle].url.detail+res.result.map(v=>v.asset_longname||v.asset).join(","))
        }).then(r=>{
          if(r.data&&r.data.details){
            r.data.details.forEach(k=>{
              this.assets.forEach(v=>{
                if(v.asset_longname===k.asset_common_name||v.asset===k.asset_common_name){
                  this.$set(v,"image",{'background-image':'url('+k.imgur_url+')'})
                }else if(!v.image){
                  this.$set(v,"image",{'background-image':'radial-gradient(ellipse at center, #ffffff 0%,#dbdbdb 100%)'})
                }
              })
            })
          }
        }).catch(e=>{
          this.loading=false
          this.$ons.notification.alert("Error: "+e.message)
        })
    },
    showTokenInfo(token,sendable=false){
      this.$store.commit("setTokenInfo",{token:token.toUpperCase(),coinId:COIN_ID,sendable})
      this.$emit("push",require("./tokenInfo.js"))
    },
    goToListTokens(){
      this.$store.commit("setTokenInfo",{addr:this.searchAddr,coinId:COIN_ID})
      this.$emit("push",require("./listTokens.js"))
    },
    goToMakeToken(){
      this.$store.commit("setTokenInfo",{coinId:COIN_ID})
      this.$emit("push",require("./makeToken.js"))

    }
  },
  mounted(){
    this.getMyAssets()
  }
})
