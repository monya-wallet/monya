const currencyList = require("../js/currencyList")
const titleList = require("../js/titleList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")
const axios = require("axios")

const COIN_ID="mona"//

module.exports=require("./monaparty.html")({
  data:()=>({
    method:"",
    paramsJson:"",
    assets:[],
    search:[],
    searchAddr:"",
    assetName:"",
    loading:false,searchKeyword:"",
    titles:[]
  }),
  store:require("../js/store.js"),
  methods:{
    getMyAssets(){
      this.loading=true
      const title = titleList.get(this.titleId)
      storage.get("addresses").then(r=>title.callCP("get_normalized_balances",{
        addresses:title.cp.getReceiveAddr()
      }))
        .then(res=>{
          this.assets=res
          this.loading=false
          return title.getCardDetail(res.map(v=>v.asset_longname||v.asset))
        }).then(r=>{
          if(r.length){
            r.forEach(k=>{
              this.assets.forEach(v=>{
                if(v.asset===k.asset){
                  this.$set(v,"image",{'background-image':'url('+k.imageUrl+')'})
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
    searchByKeyword(){
      if(!this.searchKeyword){
        return
    }else if(this.searchKeyword.length<24|this.searchKeyword.indexOf(".")>=0){
        this.showTokenInfo(this.searchKeyword)
      }else{
        this.goToListTokens(this.searchKeyword)
      }
    },
    showTokenInfo(token,sendable=false){
      this.$store.commit("setTokenInfo",{token:token.toUpperCase(),coinId:titleList.get(this.titleId).cpCoinId,sendable})
      this.$emit("push",require("./tokenInfo.js"))
    },
    goToListTokens(addr){
      this.$store.commit("setTokenInfo",{addr,coinId:titleList.get(this.titleId).cpCoinId})
      this.$emit("push",require("./listTokens.js"))
    },
    goToMakeToken(){
      this.$store.commit("setTokenInfo",{coinId:titleList.get(this.titleId).cpCoinId})
      this.$emit("push",require("./makeToken.js"))
    }
  },
  computed:{
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
    titleList.init([])
    this.titles=titleList.getTitleList()
    this.getMyAssets()
  }
})
