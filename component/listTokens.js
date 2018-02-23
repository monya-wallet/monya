const titleList = require("../js/titleList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")

module.exports=require("../js/lang.js")({ja:require("./ja/listTokens.html"),en:require("./en/listTokens.html")})({
  data(){
    return {
      assets:[],
      searchAddr:this.$store.state.addr,
      coinId:this.$store.state.coinId,
      loading:false,
      history:[],
      limit:30
    }
  },
  store:require("../js/store.js"),
  methods:{
    searchAssets(){
      const title = titleList.get(this.titleId)
      title.callCP("get_normalized_balances",{
        addresses:[this.searchAddr]
      })
        .then(res=>{
          this.assets=res
          this.loading=false
          return title.getCardDetail(res.map(v=>v.asset_longname||v.asset))
        }).then(r=>{
          if(r.length&&this.assets.length){
            r.forEach(k=>{
              this.assets.forEach(v=>{
                if(v.asset===k.asset){
                  this.$set(v,"image",{'background-image':'url('+k.imageUrl+')'})
                }else if(!v.image){
                  this.$set(v,"image",{'background-image':'radial-gradient(ellipse at center, #ffffff 0%,#dbdbdb 100%)'})
                }
              })
            })
          }else{
            this.assets.forEach(v=>{
              this.$set(v,"image",{'background-image':'radial-gradient(ellipse at center, #ffffff 0%,#dbdbdb 100%)'})
            })
          }
        }).catch(e=>{
          this.loading=false
          this.$store.commit("setError",e.message)
        })
    },
    showTokenInfo(token){
      this.$store.commit("setTokenInfo",{token:token.toUpperCase(),coinId:this.coinId})
      this.$emit("push",require("./tokenInfo.js"))
    },
    getHistory(){
      titleList.get(this.titleId).callCP("get_raw_transactions",{
        address:this.searchAddr,
        limit:this.limit
      }).then(r=>{
        this.history = r
      })
    }
  },computed:{
    titleId:{
      get(){
        return this.$store.state.monapartyTitle
      },
      set(v){
        this.$store.commit("setTitle",v)
        this.getMyAssets()
        return v
      }
    }
  },
  mounted(){
    this.searchAssets()
    this.getHistory()
  }
})
