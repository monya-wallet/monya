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
module.exports=require("../js/lang.js")({ja:require("./ja/timestamp.html"),en:require("./en/timestamp.html")})({
  data(){
    return {
      dateObj:null,
      mode:"absolute",
      now:Date.now(),
      handler:null
    }
  },
  props:["timestamp","absolute"],//must be second

  store:require("../js/store.js"),
  computed:{
    d(){
      this.now=Date.now()
      const dt=this.dateObj=new Date(this.timestamp*1000)
      const diffMsec=this.now-this.timestamp*1000
      !this.absolute&&(this.mode=this.$store.state.tsMode)
      const d={
        year:dt.getFullYear()
        ,month:dt.getMonth()+1
        ,date:dt.getDate()
        ,hour:dt.getHours()
        ,minute:dt.getMinutes()
        ,sec:dt.getSeconds()
      }

      if(diffMsec<1000*60){
        d.rightnow=true
      }else if(diffMsec<1000*60*60){
        d.minAgo=(diffMsec/1000/60)|0
      }else if(diffMsec<1000*60*60*24){
        d.hrAgo=(diffMsec/1000/60/60)|0
      }else if(diffMsec<1000*60*60*24*30){
        d.dayAgo=(diffMsec/1000/60/60/24)|0
      }else if(diffMsec<1000*60*60*24*30*12){
        d.monthAgo=(diffMsec/1000/60/60/24/30)|0
      }else{
        d.yearAgo=(diffMsec/1000/60/60/24/30/12)|0
      }
      return d
    }
  },
  created(){
    this.handler=setInterval(()=>this.now=Date.now(),30000)
  },
  beforeDestroy(){
    clearInterval(this.handler)
  },
  filters:{
    pad:v=>("0"+v).slice(-2)
  }
})
