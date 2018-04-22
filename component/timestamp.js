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
