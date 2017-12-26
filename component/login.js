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
        for(let coinId in pubs){
          if(currencyList[coinId]){
            currencyList.get(coinId).setPubSeedB58(pubs[coinId].public)
          }
        }
        
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
    storage.get("keyPairs").then((data)=>{
      if(data&&data.pubs){
        for(let coinId in data.pubs){
          if(currencyList.get(coinId)){
            currencyList.get(coinId).setPubSeedB58(data.pubs[coinId])
          }
        }
        
        this.$emit("replace",require("./home.js"))
      }else{
        this.loading=false
      }
    })
  }
})











