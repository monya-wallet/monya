/*
 MIT License

 Copyright (c) 2018 monya-wallet zenypota

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
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
