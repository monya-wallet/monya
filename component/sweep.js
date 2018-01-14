const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")

module.exports=require("./sweep.html")({
  data(){
    return {
      currency:[],
      currencyIndex:0,
      private:"",
      address:"",
      fee:0.0005
    }
  },
  store:require("../js/store.js"),
  methods:{
    send(){
      if(this.private&&this.address&&this.fee){
        const cur = currencyList.get(this.currency[this.currencyIndex].coinId)
        cur.sweep(this.private,this.address,this.fee).then((res)=>{
          cur.saveTxLabel(res.txid,{label:this.txLabel,price:parseFloat(this.price)})
          this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent",payload:{
            txId:res.txid
          }})
          this.$emit("replace",require("./finished.js"))

          
        }).catch(e=>{
          this.$store.commit("setError",e)
        })
      }
    }
    
  },
  watch:{
    currencyIndex(){
      this.fee=currencyList.get(this.currency[this.currencyIndex].coinId).defaultFeeSatPerByte*226/100000000
    }
  },
  
  mounted(){
    currencyList.each(cur=>{
      this.currency.push({
        coinId:cur.coinId,
        icon:cur.icon,
        name:cur.coinScreenName
      })
    })
    
    
  }
})
