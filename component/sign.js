/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 MissMonacoin

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
