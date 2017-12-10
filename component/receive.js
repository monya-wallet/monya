const coin = require("../js/coin.js")
const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
module.exports=require("./receive.html")({
  data(){
    return {
      mainAddress:"",
      qrDataUrl:"",
      isNative:false,
      currency:[],
      currencyIndex:0
    }
  },
  methods:{
    getMainAddress(){
      this.mainAddress=currencyList[this.currency[this.currencyIndex].coinId].getAddress(0)
      qrcode.toDataURL("monacoin:"+this.mainAddress,{
  errorCorrectionLevel: 'M',
  type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })
    },
    copyAddress(){
      
    }
    
  },
  watch:{
    currencyIndex(){
      this.getMainAddress()
    }
  },
  
  mounted(){
    
    for(let coinId in currencyList){
      this.currency.push({
        coinId,
        icon:currencyList[coinId].icon,
        name:currencyList[coinId].coinScreenName
      })
    }
    this.getMainAddress()
  }
})
