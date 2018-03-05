const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
const monappyApi=require("../js/monappyApi")

module.exports=require("../js/lang.js")({ja:require("./ja/invoice.html"),en:require("./en/invoice.html")})({
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
      requestMonappy:false,
      monappyEnabled:false,
      monappyDestination:"",
      orderDlg:false,
      orders:[],
      onOrder:[],
      monappyNotExist:false,
      isAddrUrl:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    copyAddress(){
      coinUtil.copy(this.url)
    },
    generateQR(url){
      qrcode.toDataURL(url||this.url,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,qurl)=>{
        this.qrDataUrl=qurl
      })
      if(this.currencyIndex!==-1){
        this.currentCurIcon=currencyList.get(this.currency[this.currencyIndex].coinId).icon
      }else{
        this.currentCurIcon=currencyList.get("mona").icon
      }
    },
    calcFiat(){
      this.$nextTick(()=>{
        this.fiat=Math.ceil(this.amount*this.price*10000000)/10000000
        this.generateQR()
      })
      
    },
    calcCur(){
      this.$nextTick(()=>{
        this.amount=Math.ceil(this.fiat/this.price*10000000)/10000000
        this.generateQR()
      })
    },
    getPrice(){
      coinUtil.getPrice(this.coinType,this.fiatTicker).then(res=>{
        this.price=res
      })
    },
    zaifPay(){
      this.$emit("push",require("./zaifPay.js"))
    },
    changeMonappy(){
      this.generateQR()
      this.monappyNotExist=false
      if (this.monappyDestination) {
        monappyApi.getAddress(this.monappyDestination).then(r=>{
          this.monappyNotExist=!r
        }).catch(r=>{
          this.monappyNotExist=true
        })
      }
    },
    share(event){
      const targetRect = event.target.getBoundingClientRect(),
            targetBounds = targetRect.left + ',' + targetRect.top + ',' + targetRect.width + ',' + targetRect.height;
      coinUtil.share({
        url:this.url
      },targetBounds).then(()=>{
      }).catch(()=>{
        this.copyAddress()
      })
    }
  },
  computed:{
    url(){
      if(this.currencyIndex===-1){
        return "https://monappy.jp/users/send/@"+this.monappyDestination+"?amount="+parseFloat(this.amount)+"&message="+encodeURIComponent(this.message)
      }
      if(!this.currency[this.currencyIndex]){
        return
      }
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)
      const url = coinUtil.getBip21(cur.bip21,cur.getAddress(0,this.addressIndex|0),{
        amount:this.amount,
        label:this.labels[this.addressIndex],
        message:this.message,
        "req-opreturn":this.messageOpRet
      },this.isAddrUrl)
      this.generateQR(url)
      return url
    },
    coinType(){
      if(this.currencyIndex===-1){
        return "mona"
      }
      if(this.currency[this.currencyIndex]){
        return this.currency[this.currencyIndex].coinId
      }
      return ""
    },
    total(){
      let total=0
      this.onOrder.forEach(i=>{
        total+=parseFloat(this.orders[i].price)
      })
      return total
    }
  },
  watch:{
    currencyIndex(){
      this.generateQR()
      if(this.currencyIndex!==-1){
        currencyList.get(this.currency[this.currencyIndex].coinId).getLabels().then(res=>{
          this.$set(this,"labels",res)
        })
      }
      this.getPrice()
      this.fiat=0
      this.amount=0
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
    storage.get("settings").then((data)=>{
      if(!data){data={}}
      this.monappyEnabled=data.monappy&&data.monappy.enabled;
      this.monappyDestination=(data.monappy&&data.monappy.myUserId)||""
    })
    this.generateQR()
    this.getPrice()

    storage.get("orders").then(r=>{
      this.orders=r||[]
    })
    this.isNative = !!(window.plugins&&window.plugins.socialsharing)
  }
})
