const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")

module.exports=require("./listTokens.html")({
  data(){
    return {
      search:[],
      searchAddr:this.$store.state.addr,
      coinId:this.$store.state.coinId,
      loading:false,
      
    }
  },
  store:require("../js/store.js"),
  methods:{
    searchAssets(){
      this.loading=true
      currencyList.get(this.coinId).callCP("get_normalized_balances",{
        addresses:[this.searchAddr]
      }).then(res=>{
        this.search=res
        this.loading=false
      })
    },
    showTokenInfo(token){
      this.$store.commit("setTokenInfo",{token:token.toUpperCase(),coinId:this.coinId})
      this.$emit("push",require("./tokenInfo.js"))
    }
  },
  mounted(){
    this.searchAssets()
  }
})
