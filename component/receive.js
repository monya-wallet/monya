const coin = require("../js/coin.js")
const qrcode = require("qrcode")
module.exports=require("./receive.html")({
  data(){
    return {
      mainAddress:"",
      qrDataUrl:"",
      isNative:false
    }
  },
  methods:{
    getMainAddress(){
      this.mainAddress=coin.getAddress("mona",0)
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
  mounted(){
    this.getMainAddress()
  }
})
