const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const qrcode = require("qrcode")
const coinUtil = require("../js/coinUtil")
module.exports=require("./sign.html")({
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
        this.$ons.notification.alert(e.message||"Error.Please try again")
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
  },
  watch:{
    address(){
      this.$set(this,"possibility",[])
      if(this.address){
        
        currencyList.eachWithPub((cur)=>{
          if(cur.prefixes.indexOf(this.address[0])>=0){
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
