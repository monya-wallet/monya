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
const crypto = require("crypto")

module.exports=require("../js/lang.js")({ja:require("./ja/generateKey.html"),en:require("./en/generateKey.html")})({
  data(){
    return {
      cnt:0,
      wordCount:this.$store.state.entropySize,
      next:false,
      keyArray:[],
      sensorAvailable:false
      
    }
  },
  store:require("../js/store.js"),
  methods:{
    complete(){
      if(!this.next){
        this.next=true;
        
        this.$store.commit("setEntropy",this.keyArray.map(v=>("0"+v.toString(16)).slice(-2)).join(""))
        this.$emit("pop")
        this.$emit("push",require("./showPassphrase"))
      }
    },
    skip(){
      if(!this.next){
        this.next=true;
        
        this.$store.commit("setEntropy",crypto.randomBytes(this.wordCount).toString('hex'))
        this.$emit("pop")
        this.$emit("push",require("./showPassphrase"))
      }
    }
  },
  
  mounted(){
    let detecting = true;
    let drag=false;
    let arr=[];
    const gd = this.$ons.GestureDetector(this.$refs.touchArea)
    gd.on("dragstart",()=>{
      if(!detecting){return}
      drag=true;
    })
    gd.on("drag",(e)=>{
      if(!detecting){return}
      if(((Math.random()*19)|0)===4){
        const a=((e.gesture.interimAngle*e.gesture.deltaX*e.gesture.deltaY)|0)%2048;
        if(a){
          arr.push(a>0?a:-a)
        }
      }
    });
    gd.on("dragend",()=>{
      if(!detecting){return}
      drag=false;
      if(arr.length){
        let sum=16;
        for(let i=arr.length-1;i>=0;i--){
          sum+=arr[i];
        }
        this.keyArray.push(sum%256);
        if(++this.cnt>=this.wordCount){
          detecting = false
          setInterval(()=>{this.complete()},300);
        }
      }
      arr=[];
    })
    window.addEventListener("devicemotion",(e)=>{
      if(!detecting){return}
      if(e.rotationRate.alpha){
        this.sensorAvailable=true
      }

      if(12===((Math.random()*45)|0)){
        let a=((e.acceleration.x+e.acceleration.y+e.rotationRate.alpha+e.rotationRate.beta+e.rotationRate.gamma)*810893)|0;
        a=a>0?a:-a
        if(a>30){
          this.keyArray.push(a%256)
          if(++this.cnt>=this.wordCount){
            detecting = false
            setInterval(()=>{this.complete()},300);
          }
        }
      }
    }, true);
  }
})
