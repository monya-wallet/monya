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
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const qrcode = require("qrcode")
const coinUtil = require("../js/coinUtil")
module.exports=require("../js/lang.js")({ja:require("./ja/sign.html"),en:require("./en/sign.html")})({
  data(){
    return {
      address:"",
      message:"",
      signature:"",
      password:"",
      dlg:false,
      result:false,
      possibility:[],
      coinType:"",
      qrDataUrl:"",
      currentCurIcon:""
    }
  },
  methods:{
    sign(){
      storage.get("keyPairs").then((cipher)=>{
        const cur =currencyList.get(this.coinType)
        this.signature=cur.signMessage(this.message,cipher.entropy,this.password,this.path)
        this.password=""
        this.generateQR(coinUtil.getBip21(cur.bip21,this.address,{
        message:this.message,
        "req-signature":this.signature
      }))
      }).catch(e=>{
        this.$store.commit("setError",e.message||"Unknown")
      })
    },
    verify(){
      this.result=currencyList.get(this.coinType).verifyMessage(this.message,this.address,this.signature)
      this.dlg=true
    },
    generateQR(url2){
      qrcode.toDataURL(url2,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })
        this.currentCurIcon=currencyList.get(this.coinType).icon
    },
    goToReceive(){
      this.$emit("push",require("./receive.js"))
    }
  },
  watch:{
    address(){
      this.$set(this,"possibility",[])
      if(this.address){
        
        currencyList.eachWithPub((cur)=>{
          const ver = coinUtil.getAddrVersion(this.address)
          if(ver===cur.network.pubKeyHash||
             ver===cur.network.scriptHash){
            this.possibility.push({
              name:cur.coinScreenName,
              coinId:cur.coinId
            })
          }
        })
        if(this.possibility[0]){
          this.coinType=this.possibility[0].coinId
        }else{
          this.coinType=""
        }
        
        
      }else{
        this.coinType=""
      }
    },
    
    coinType(){
      if(this.coinType){
        this.path=currencyList.get(this.coinType).getIndexFromAddress(this.address)
      }else{
        this.path=false
      }
    }
  }
})
