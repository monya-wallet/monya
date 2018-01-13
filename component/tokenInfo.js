const currencyList = require("../js/currencyList")
const titleList = require("../js/titleList")
const axios = require("axios")
module.exports=require("./tokenInfo.html")({
  data(){return{
    token:this.$store.state.tokenInfo,
    coinId:this.$store.state.coinId,
    sendable:this.$store.state.sendable,
    asset:null,
    history:[],
    loading:true,
    card:null
  }},
  store:require("../js/store.js"),
  methods:{
    sendToken(){
      this.$store.commit("setTokenInfo",{token:this.token,coinId:this.coinId,sendable:this.sendable,divisible:this.asset.divisible})
      this.$emit("push",require("./sendToken.js"))
    }
  },
  computed:{
    titleId:{
      get(){
        return this.$store.state.monapartyTitle
      },
      set(v){
        this.$store.commit("setTitle",v)
        return v
      }
    }
  },
  mounted(){
    const title = titleList.get(this.titleId)
    title.getToken(this.token).then(r=>{
      this.asset=r.asset[0]
      this.card=r.card[0]
      this.loading=false
      if(this.asset){
        return title.getTokenHistory(this.asset.asset)
      }else{
        return {}
      }
    }).then(r=>{
      this.history=r
    }).catch(e=>{
          this.loading=false
          this.$store.commit("setError",e.message)
        })
  }      
})
