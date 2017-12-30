const storage = require("../js/storage.js")
const currencyList = require("../js/currencyList")
module.exports = require("./customCoin.html")({
  data:()=>({
    coinJson:"",
    error:false
  }),
  methods:{
    loadJson(){
      let coinParam=null;
      try{
        coinParam = JSON.parse(this.coinJson)
      }catch(e){
        this.error=true
        return
      }
      storage.get("customCoins").then(r=>{
        if (!r) {
          r=[]
        }
        r.push(coinParam)
        return storage.set("customCoins",r)
      }).then(()=>{
        this.$emit("pop")
      }).catch(()=>{
        this.error=true
      })
    }
  }
})
