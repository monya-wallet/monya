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
const QRScanner = window.QRScanner
const coinUtil=require("../js/coinUtil")
const ext = require("../js/extension.js")

module.exports=require("../js/lang.js")({ja:require("./ja/qrcode.html"),en:require("./en/qrcode.html")})({
  data:()=>({
    cameras:[],
    loading:true,
    error:false,
    scanner:null,
    cameraIndex:0,
    canEnableLight:false,
    lightEnabled:false,
    canChangeCamera:false,
    currentCamera:0,
    result:"",
  }),
  store:require("../js/store.js"),
  methods:{
    back(){
      QRScanner.destroy((status)=>{
        this.$emit("pop")
        this.$store.commit("setTransparency",false)
      });
    },
    settings(){
      QRScanner.openSettings();
    },
    parse(content){
      coinUtil.parseUrl(content).then(res=>{
        if(res.isCoinAddress&&res.isPrefixOk&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          this.$emit("pop")
          this.$emit("push",require("./send.js"))
          
          
        }else if(res.extension){
          this.$store.commit("setExtensionSend",{
            memo:res.message,
            address:res.address,
            amount:res.amount,
            label:res.label
          })
          this.$emit("pop")
          this.$emit("push",res.extension.component)
        }else if(res.apiName){
          this.$emit("pop")
          coinUtil.callAPI(res.apiName,res.apiParam)
        }else if(res.protocol==="http"||res.protocol==="https"){

          // address page handler
          const paramAddr=res.raw.searchParams.get("address")
          const paramScheme=res.raw.searchParams.get("scheme")
          if(paramAddr&&paramScheme){
            const paramAmount=res.raw.searchParams.get("amount")
            const paramMessage=res.raw.searchParams.get("message")
            const paramLabel=res.raw.searchParams.get("label")
            return this.parse(coinUtil.getBip21(paramScheme,paramAddr,{
              amount:paramAmount,
              message:paramMessage,
              label:paramLabel
            }))
            
          }else{
            this.$emit("pop")
            coinUtil.openUrl(res.url)
          }
          
          
        }else{
          this.result=res.url
        }
        
        this.$store.commit("setTransparency",false)
      })
    },
    copyResult(){
      coinUtil.copy(this.result)
      this.back()
    },
    toggleLight(){
      if(this.lightEnabled){
        QRScanner.disableLight((err, status)=>{
          this.$set(this,"lightEnabled",status&&status.lightEnabled)
        });
      }else{
        QRScanner.enableLight((err, status)=>{
          this.$set(this,"lightEnabled",status&&status.lightEnabled)
        });
      }
    },
    changeCam(){
      this.$set(this,"loading",true)
      QRScanner.useCamera((!this.currentCamera)|0, (err, status)=>{
        this.$set(this,"currentCamera",status&&status.currentCamera)
        this.$set(this,"loading",false)
      });
    }
  },
  mounted(){
    this.$store.commit("setTransparency",true)
    this.loading=true
    QRScanner.prepare((err, status)=>{
      if (err) {
        return this.$store.commit("setError","error code:"+err&&err.code)
      }
      if (status.authorized) {
        this.$set(this,"canEnableLight",status.canEnableLight)
        this.$set(this,"canChangeCamera",status.canChangeCamera)
        this.$set(this,"lightEnabled",status&&status.lightEnabled)
        this.$set(this,"currentCamera",status.currentCamera)
        this.$set(this,"loading",false)
        QRScanner.scan((err2,t)=>{
          if (err2) {
            if(err2.code===6){return }
            this.$store.commit("setError","error code:"+err2.code)
            return
          }
          QRScanner.destroy(()=>{
            this.parse(t)
          })
        })
        if(window.cordova&&window.cordova.platformId!=="browser"){ // ios Quirks
          QRScanner.show()
        }
        
      } else if (status.denied) {
        this.$ons.notification.alert("Please allow Camera")
      } else {
        this.back()
      }
    })
    
    
  }
})
