const coin = require("../js/coin.js")
const storage = require("../js/storage.js")
const currencyList = require("../js/currencyList")
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
        //return coin.decryptAndRestore(cipher,this.password)
      }).then(()=>{
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
      if(typeof data !=="string"){
        for(let coinId in currencyList){
          if(data[coinId]){
            currencyList[coinId].setPubSeedB58(data[coinId].public)
          }
        }
        this.$emit("replace",require("./home.js"))
      }else{
        this.loading=false
      }
    })
  }
})
