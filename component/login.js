const storage = require("../js/storage.js")
const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil.js")
module.exports=require("../js/lang.js")({ja:require("./ja/login.html"),en:require("./en/login.html")})({
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
          makeCur:["mona","zny"]
        })
      }).then((pubs)=>{
        currencyList.each(cur=>{
          cur.hdPubNode=null
          if(pubs[cur.coinId]){
            cur.setPubSeedB58(pubs[cur.coinId])
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
        return true
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
      this.$emit("replace",require("./home.js"))
      coinUtil.setInitialized(true)
      return storage.set("addresses",addrs)
    }).catch(e=>{
      this.$store.commit("setError",e.message)
    })
  }
})
