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
