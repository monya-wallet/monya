const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")

const COIN_ID="mona"

module.exports=require("./listTokens.html")({
  data(){
    return {
      search:[],
      searchAddr:this.$store.state.addr,
      loading:false,
      
    }
  },
  store:require("../js/store.js"),
  methods:{
    searchAssets(){
      this.loading=true
      currencyList.get(COIN_ID).callCP("get_normalized_balances",{
        addresses:[this.searchAddr]
      }).then(res=>{
        this.search=res.result
        this.loading=false
      })
    },
    showTokenInfo(token){
      this.$store.commit("setTokenInfo",{token:token.toUpperCase(),coinId:COIN_ID})
      this.$emit("push",require("./tokenInfo.js"))
    }
  },
  mounted(){
    this.searchAssets()
  }
})
