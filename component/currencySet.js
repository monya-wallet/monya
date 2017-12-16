const currencyList = require("../js/currencyList")
module.exports=require("./currencySet.html")({
  data(){
    return {}
  },
  props:["amount","ticker","easy","about","fiatTicker"],
  methods:{
    getTicker(t){
      if(!t){return ""}
      
      if(t==="jpy"){
        return this.easy?"円":"JPY"
      }
      if(t==="satByte"){
        return "sat/B"
      }
      return this.easy?currencyList.get(t).unitEasy:currencyList.get(t).unit
    }
  },
  computed:{
    tickerCap(){
      return this.getTicker(this.ticker)+(this.fiatTicker?"/"+this.getTicker(this.fiatTicker):"")
    }
  }
})
