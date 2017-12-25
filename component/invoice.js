const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("./invoice.html")({
  data(){
    return {
      address:"",
      qrDataUrl:"",
      isNative:false,
      edit:false,
      amount:0,
      message:"",
      addressIndex:0,
      messageOpRet:"",
      currency:[],
      currencyIndex:0,
      labels:[coinUtil.DEFAULT_LABEL_NAME],
      fiat:0,
      price:0,
      fiatTicker:this.$store.state.fiat,
    }
  },
  store:require("../js/store.js"),
  methods:{
    copyAddress(){
      coinUtil.copy(this.address)
    },
    generateQR(){
      qrcode.toDataURL(this.url,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })
      this.currentCurIcon=currencyList.get(this.currency[this.currencyIndex].coinId).icon
    },
    calcFiat(){
      this.$nextTick(()=>{
        this.fiat=this.amount*this.price
        this.generateQR()
      })
      
    },
    calcCur(){
      this.$nextTick(()=>{
        this.amount=this.fiat/this.price
        this.generateQR()
      })
    },
    getPrice(){
      coinUtil.getPrice(this.coinType,this.fiatTicker).then(res=>{
        this.price=res
      })
    }
  },
  computed:{
    url(){
      if(!this.currency[this.currencyIndex]){
        return ""
      }
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)
      return coinUtil.getBip21(cur.bip21,cur.getAddress(0,this.addressIndex|0),{
        amount:this.amount,
        label:this.labels[this.addressIndex],
        message:this.message,
        "req-opreturn":this.messageOpRet
      })
    },
    coinType(){
      return (this.currency[this.currencyIndex])?this.currency[this.currencyIndex].coinId:""
    }
  },

  mounted(){
    currencyList.eachWithPub(cur=>{
      this.currency.push({
        coinId:cur.coinId,
        icon:cur.icon,
        name:cur.coinScreenName
      })
    })
    this.generateQR()
    coinUtil.getLabels(this.currency[this.currencyIndex].coinId).then(res=>{
        this.$set(this,"labels",res)
    })
    this.getPrice()
  }
})
