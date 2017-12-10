const currencyList = require("../js/currencyList")
module.exports=require("./currencySet.html")({
  data(){
    return {}
  },
  props:["amount","ticker","easy"],
  computed:{
    
    tickerCap(){
      if(!this.ticker){return ""}
      if(this.ticker=="jpy"){
        return this.easy?"円":"JPY"
      }
      return this.easy?currencyList[this.ticker].unitEasy:currencyList[this.ticker].unit
    }
  }
})
