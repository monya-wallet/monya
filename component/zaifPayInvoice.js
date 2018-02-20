const storage = require("../js/storage")
const axios = require("axios")
const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
const crypto = require("crypto")
module.exports=require("../js/lang.js")({ja:require("./ja/zaifPayInvoice.html"),en:require("./en/zaifPayInvoice.html")})({
  data:()=>({
    hasCredentials:false,
    res:{},
    loading:false,
    qrDataUrl:""
  }),
  methods:{
    getInvoice(){
      this.loading=true;
      
      storage.get("settings").then((d)=>{
        const payloadObj = {
          method:"getInvoice",
          md5secret:crypto.createHash("md5").update(d.zaifPay.secret).digest("hex"),
          key:d.zaifPay.apiKey,
          invoiceId:this.$store.state.zaifPayInvoiceId,
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
        
        this.$set(this,"res",res.data.return)
        this.currentCurIcon=currencyList.get(this.res.currency).icon
        this.generateQR()
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
    }
  },
  computed:{
    curAmt(){
      return this.res.mona||this.res.btc||0
    }
  },
  mounted(){
    storage.get("settings").then((data)=>{
      if(data.zaifPay){
        this.hasCredentials=data.zaifPay.apiKey&&data.zaifPay.secret
      }
      this.getInvoice()
    })
    
  }
})

