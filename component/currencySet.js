/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 monya-wallet

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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
  },
  nyaan:{
    en:"Nyaan",
    ja:"にゃーん"
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
      if(t==="nyaan"){
        return easyCurTable.nyaan[lang.getLang()]
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
