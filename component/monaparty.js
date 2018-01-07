const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")

const COIN_ID="mona"

module.exports=require("./monaparty.html")({
  data:()=>({
    method:"",
    paramsJson:"",
    assets:[],
    search:[],
    searchAddr:"",
    assetName:"",
    loading:false
  }),
  store:require("../js/store.js"),
  methods:{
    send(){
      currencyList.get(COIN_ID).callCP(this.method,JSON.parse(this.paramsJson)).then(res=>{
        console.log(res)
      })
    },
    getMyAssets(){
      const cur = currencyList.get(COIN_ID)
      storage.get("addresses").then(r=>cur.callCP("get_normalized_balances",{
        addresses:cur.getReceiveAddr()
      }))
      .then(res=>{
        this.assets=res.result
      })
    },
    showTokenInfo(token){
      this.$store.commit("setTokenInfo",{token:token.toUpperCase(),coinId:COIN_ID})
      this.$emit("push",require("./tokenInfo.js"))
    },
    goToSendToken(token){
      this.$store.commit("setTokenInfo",{token,coinId:COIN_ID})
      this.$emit("push",require("./sendToken.js"))
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
