const storage = require("../js/storage")
const axios = require("axios")
const coinUtil = require("../js/coinUtil")
const crypto = require("crypto")
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
    invoices:[]
  }),
  methods:{
    createInvoice(){
      this.loading=true;
      let result=null
      storage.get("settings").then((d)=>{
        const payloadObj = {
          method:"createInvoice",
          md5secret:crypto.createHash("md5").update(d.zaifPay.secret).digest("hex"),
          key:d.zaifPay.apiKey,
          speed:this.speed,
          currency:this.cur,
          amount:this.amount|0,
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
        })
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
          bip21:result.data.return.bip21
        })
        return storage.set("zaifPayInvoice",this.invoices)
      }).then(()=>{
        this.loading=false
        this.$store.commit("setZaifPayInvoiceId",result.data.return.invoiceId)
        this.$emit("push",require("./zaifPayInvoice.js"))
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
      this.$store.commit("setZaifPayInvoiceId",id)
      this.$emit("push",require("./zaifPayInvoice"))
    },
    health(){
      
      this.$emit("push",require("./zaifHealth"))
    }
  },
  mounted(){
    storage.get("settings").then((data)=>{
      if(data.zaifPay){
        this.hasCredentials=data.zaifPay.apiKey&&data.zaifPay.secret
        return storage.get("zaifPayInvoice")
      }
    }).then(invs=>{
      this.invoices=invs||[]
    })
    
  }
})
