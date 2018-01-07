const currencyList = require("../js/currencyList")
module.exports=require("./currencySet.html")({
  data(){
    return {}
  },
  props:["amount","notKnown","ticker","about","fiatTicker"],
  methods:{
    getTicker(t){
      if(!t){return ""}
      if(this.notKnown){return t}
      if(t==="jpy"){
        return this.easy?"円":"JPY"
      }
      if(t==="satByte"){
        return "sat/B"
      }
      return this.easy?currencyList.get(t).unitEasy:currencyList.get(t).unit
    }
  },
  store:require("../js/store.js"),
  computed:{
    tickerCap(){
      if(this.fiatTicker){
        return this.getTicker(this.fiatTicker)+"=1"+this.getTicker(this.ticker)
      }else{
        return this.getTicker(this.ticker)
      }

    },
    compAmt(){
      return isNaN(parseFloat(this.amount))?"":(this.amount+"").slice(0,14)
    },
    easy(){
      return this.$store.state.easyUnit
    }
  }
})
