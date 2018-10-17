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
const axios = require("axios")
const coinUtil = require("../js/coinUtil")
const crypto = require("crypto")
const currencyList = require("../js/currencyList")
const extension=require("../js/extension.js")
const storage=require("../js/storage.js")
let ext;

const qrcode = require("qrcode")

module.exports=require("../js/lang.js")({ja:require("./ja/zaifPay.html"),en:require("./en/zaifPay.html")})({
  data:()=>({
    hasCredentials:false,
    cur:"mona",
    speed:"medium",
    amount:0,
    orderId:"",
    ref:"",
    itemName:"",
    loading:false,
    invoices:[],

    apiKey:"",
    md5secret:"",

    res:{},
    qrDataUrl:"",
    invoiceDlg:false,

    resetDialog:false
  }),
  methods:{
    createInvoice(){
      this.loading=true;
      let result=null
      const payloadObj = {
        method:"createInvoice",
        md5secret:this.md5secret,
        key:this.apiKey,
        speed:this.speed,
        currency:this.cur,
        amount:parseFloat(this.amount),
        itemName:this.itemName,
        orderNumber:this.orderId,
        referenceNumber:this.ref,
        nonce:(Date.now()/1000)+""
      }
      let payload="";
      for(let v in payloadObj){
        if(payloadObj[v]){
          payload+=encodeURIComponent(v)+"="+encodeURIComponent(payloadObj[v])+"&"
        }
      }
      
      return axios({
        method:"POST",
        url:coinUtil.proxyUrl("https://api.zaif.jp/ecapi"),
        data:payload.slice(0,-1)
      }).then(res=>{
        if(!res.data.success){
          throw new Error("Not successful")
        }
        result=res

        this.invoices.push({
          invoiceId:result.data.return.invoiceId,
          speed:this.speed,
          currency:this.cur,
          amount:this.amount|0,
          itemName:this.itemName,
          orderNumber:this.orderId,
          referenceNumber:this.ref,
          created:result.data.return.created,
          expired:result.data.return.expired,
          rate:result.data.return.rate,
          btc:result.data.return.btc||0,
          mona:result.data.return.mona||0,
          address:result.data.return.address,
          bip21:result.data.return.BIP21
        })
        this.showInvoice(result.data.return.invoiceId)
        return ext.set("invoice",this.invoices)
      }).then(()=>{
        this.loading=false
      }).catch(e=>{
        if(e&&e.response){
          this.$ons.notification.alert(e.response.status)
        }else{
          this.$ons.notification.alert("An error occured, not 502.")
        }
        this.loading=false
      })
    },
    showInvoice(id){
      
      const payloadObj = {
        method:"getInvoice",
        md5secret:this.md5secret,
        key:this.apiKey,
        invoiceId:id,
        nonce:(Date.now()/1000)+""
      }
      let payload="";
      for(let v in payloadObj){
        if(payloadObj[v]){
          payload+=encodeURIComponent(v)+"="+encodeURIComponent(payloadObj[v])+"&"
        }
      }
      axios({
        method:"POST",
        url:coinUtil.proxyUrl("https://api.zaif.jp/ecapi"),
        data:payload.slice(0,-1)
      }).then(res=>{
        if(!res.data.success){
          throw new Error("Not successful")
        }
        
        this.$set(this,"res",res.data.return)
        this.currentCurIcon=currencyList.get(this.res.currency).icon
        this.generateQR()
        this.invoiceDlg=true
      }).catch(e=>{
        if(e&&e.response){
          this.$ons.notification.alert(e.response.status)
        }else{
          this.$ons.notification.alert("An error occured, not 502.")
        }
      })
    },
    copyAddress(){
      coinUtil.copy(this.res.address)
    },
    generateQR(){
      qrcode.toDataURL(this.res.BIP21,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })
    },
    saveCredentials(){
      if(this.apiKey){
        this.md5secret=crypto.createHash("md5").update(this.secret).digest("hex")
        ext.set("credentials",{
          apiKey:this.apiKey,
          md5secret:this.md5secret
        })
        
        this.hasCredentials=true
      }
    },
    eraseCredentials(){
      ext.set("credentials",{})
      this.resetDialog=false;
      this.hasCredentials=false
    },
    migrate(){
      storage.get("settings").then(s=>{
        if(s.zaifPay.apiKey){
          const md5s = crypto.createHash("md5").update(s.zaifPay.secret).digest("hex")
          ext.set("credentials",{
            apiKey:s.zaifPay.apiKey,
            md5secret:md5s
          })
          this.apiKey=s.zaifPay.apiKey
          this.md5secret=md5s
          this.hasCredentials=true
        }
      })
    }
  },
  mounted(){
    ext=extension.extStorage("zaifPay")// because of circular referrence
    ext.get("credentials").then((data)=>{
      this.hasCredentials=data&&data.apiKey&&data.md5secret
      if(!this.hasCredentials){
        return this.migrate()
      }
      this.apiKey=data.apiKey
      this.md5secret=data.md5secret
      return ext.get("invoice")
    }).then(invs=>{
      this.invoices=invs||[]
    })
    
  }
})
