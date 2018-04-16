const titleList = require("../js/titleList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")
const axios = require("axios")
const currencyList = require("../js/currencyList")

module.exports=require("../js/lang.js")({ja:require("./ja/monaparty.html"),en:require("./en/monaparty.html")})({
  data:()=>({
    method:"",
    paramsJson:"",
    assets:[],
    search:[],
    searchAddr:"",
    assetName:"",
    loading:false,searchKeyword:"",
    titles:{},
    titDlg:false,
    titleAdd:false,
    coins:[],

    t:{
      cpCoinId:"",
      titleId:"",
      titleName:"",
      apiVer:false,
      apiEndpoint:"",
      icon:""
    }
  }),
  store:require("../js/store.js"),
  methods:{
    getMyAssets(){
      this.loading=true
      const title = titleList.get(this.titleId)
      title.callCP("get_normalized_balances",{
        addresses:title.cp.getReceiveAddr()
      }).then(res=>{
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
    searchByKeyword(){
      if(!this.searchKeyword){
        return
    }else if(this.searchKeyword.length<24|this.searchKeyword.indexOf(".")>=0){
        this.showTokenInfo(this.searchKeyword)
      }else{
        this.goToListTokens(this.searchKeyword)
      }
    },
    showTokenInfo(tokenRaw,sendable=false){
      const t = tokenRaw.split(".")
      t[0]=t[0].toUpperCase()
      const token = t.join(".")
      this.$store.commit("setTokenInfo",{token,coinId:titleList.get(this.titleId).cpCoinId,sendable})
      this.$emit("push",require("./tokenInfo.js"))
    },
    goToListTokens(addr){
      this.$store.commit("setTokenInfo",{addr,coinId:titleList.get(this.titleId).cpCoinId})
      this.$emit("push",require("./listTokens.js"))
    },
    goToMakeToken(){
      this.$store.commit("setTokenInfo",{coinId:titleList.get(this.titleId).cpCoinId})
      this.$emit("push",require("./makeToken.js"))
    },
    goToDex(){
      this.$store.commit("setTokenInfo",{coinId:titleList.get(this.titleId).cpCoinId})
      this.$emit("push",require("./dexOrder.js"))
    },
    addTitle(){
      storage.get("customTitles").then(res=>{
        this.t.apiVer=parseInt(this.t.apiVer)
        if(res){
          res.push(this.t)
        }else{
          res=[this.t]
        }
        titleList.init(res||[])
        
        const tl=titleList.getTitleList()
        for(let k in tl){
          if(tl[k].cp.hdPubNode){
            this.$set(this.titles,k,tl[k])
          }
        }
        return storage.set("customTitles",res)
      }).then(()=>{
        this.t = {
          cpCoinId:"",
          titleId:"",
          titleName:"",
          apiVer:false,
          apiEndpoint:"",
          icon:""
        }
        this.titleAdd=false
        this.titDlg=false
      })
        
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
        this.titDlg=false
        return v
      }
    }
  },
  created(){
    storage.get("customTitles").then(res=>{
      titleList.init(res||[])

      let id=""
      const tl=titleList.getTitleList()
      for(let k in tl){
        if(tl[k].cp.hdPubNode){
          this.$set(this.titles,k,tl[k])
          id=k
        }
      }
      this.titleId=id
    })
    currencyList.eachWithPub(cur=>{
      if(cur.counterpartyEndpoint){
        this.coins.push({coinId:cur.coinId,name:cur.coinScreenName})
      }
    })
    if(window.StatusBar){
      window.StatusBar.styleLightContent();
    }
  }
})
