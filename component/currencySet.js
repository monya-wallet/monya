const currencyList = require("../js/currencyList")
const lang = require("../js/lang.js")

const easyCurTable = {
  jpy:{
    en:"Yen",
    ja:"円"
  },
  usd:{
    en:"ドル",
    ja:"Dollar"
  }
}

module.exports=lang({ja:require("./ja/currencySet.html"),en:require("./en/currencySet.html")})({
  data(){
    return {
      
    }
  },
  props:["amount","notKnown","ticker","about","fiatTicker"],
  methods:{
    getTicker(t){
      if(!t){return ""}
      if(this.notKnown){return t}
      if(t==="jpy"){
        return this.easy?easyCurTable.jpy[lang.getLang()]:"JPY"
      }
      if(t==="usd"){
        return this.easy?easyCurTable.usd[lang.getLang()]:"USD"
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
