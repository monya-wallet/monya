module.exports=require("./timestamp.html")({
  data(){
    return {
      dateObj:null,
      d:{},
      mode:"absolute"
    }
  },
  props:["timestamp","absolute"],//must be second
  methods:{
    
  },
  store:require("../js/store.js"),
  computed:{
    
  },
  mounted(){
    const dt=this.dateObj=new Date(this.timestamp*1000)
    const diffMsec=Date.now()-this.timestamp*1000
    !this.absolute&&(this.mode=this.$store.state.tsMode)
    this.d.year=dt.getFullYear()
    this.d.month=dt.getMonth()+1
    this.d.date=dt.getDate()
    this.d.hour=dt.getHours()
    this.d.minute=dt.getMinutes()
    this.d.sec=dt.getSeconds()

    if(diffMsec<1000*60){
      this.d.rightnow=true
    }else if(diffMsec<1000*60*60){
      this.d.minAgo=(diffMsec/1000/60)|0
    }else if(diffMsec<1000*60*60*24){
      this.d.hrAgo=(diffMsec/1000/60/60)|0
    }else if(diffMsec<1000*60*60*24*30){
      this.d.dayAgo=(diffMsec/1000/60/60/24)|0
    }else if(diffMsec<1000*60*60*24*30*12){
      this.d.monthAgo=(diffMsec/1000/60/60/24/30)|0
    }else{
      this.d.yearAgo=(diffMsec/1000/60/60/24/30/12)|0
    }
  }
})
