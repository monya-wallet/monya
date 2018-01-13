const storage = require("../js/storage.js")
const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil.js")
module.exports=require("./login.html")({
  data(){
    return {
      showPassword:false,
      password:"",
      incorrect:false,
      loading:true
    }
  },
  methods:{
    start(){
      this.loading=true
      storage.get("keyPairs").then((cipher)=>{
        return coinUtil.decryptKeys({
          entropyCipher:cipher.entropy,
          password:this.password,
          makeCur:["mona","btc"]
        })
      }).then((pubs)=>{
        currencyList.each(cur=>{
          cur.hdPubNode=null
          if(pubs[cur.coinId]){
            cur.setPubSeedB58(pubs[cur.coinId].public)
          }
        })

        this.$emit("replace",require("./home.js"))
      }).catch(()=>{
        this.loading=false
        this.incorrect=true;
        setTimeout(()=>{
          this.incorrect=false;
        },1000)
      })
    }
  },
  mounted(){
    this.loading=true
    Promise.all([storage.get("keyPairs"),storage.get("addresses"),storage.get("customCoins")]).then(res=>{
      const data=res[0]
      const addrs=res[1]||{}
      const customCoins = res[2]||[]
      this.$store.commit("setKeyPairsExistence",!!data)
      currencyList.init(customCoins)
      if(!data||!data.pubs){
        this.loading=false
        return
      }
      currencyList.each(cur=>{
        cur.hdPubNode=null
        if(data.pubs[cur.coinId]){
          cur.setPubSeedB58(data.pubs[cur.coinId])
          if(!addrs[cur.coinId]){
            addrs[cur.coinId]={}
          }
          cur.addresses=addrs[cur.coinId]
          cur.pregenerateAddress()
        }
      })
      return storage.set("addresses",addrs)
    }).then(()=>{
      const url = coinUtil.getQueuedUrl()
      if (url) {
        coinUtil.parseUrl(url).then(res=>{
        if(res.isCoinAddress&&res.isPrefixOk&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          this.$emit("push",require("./send.js"))
        }else if(res.protocol==="http"||res.protocol==="https"){
          window.open(res.url)
        }else{
          this.$ons.notification.alert(res.url)
        }
      })
      }else{
        this.$emit("replace",require("./home.js"))
      }
      coinUtil.hasInitialized=true
    }).catch(e=>{
      this.$store.commit("setError",e.message)
    })
  }
})
