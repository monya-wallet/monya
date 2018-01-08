const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const Currency = require("../js/currency")
const coinUtil = require("../js/coinUtil")

module.exports=require("./receive.html")({
  data(){
    return {
      mainAddress:"",
      qrDataUrl:"",
      currentCurIcon:"",
      isNative:false,
      currency:[],
      currencyIndex:0,
      labels:[coinUtil.DEFAULT_LABEL_NAME],
      dialogVisible:false,
      labelInput:"",
      maxLabel:coinUtil.GAP_LIMIT,
      state:"initial"
    }
  },
  store:require("../js/store.js"),
  methods:{
    getMainAddress(){
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)
      this.mainAddress=cur.getAddress(0,0)
      qrcode.toDataURL(cur.bip21+":"+this.mainAddress,{
  errorCorrectionLevel: 'M',
  type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })

      this.currentCurIcon=cur.icon
    },
    copyAddress(){
      coinUtil.copy(currencyList.get(this.currency[this.currencyIndex].coinId).bip21+":"+this.mainAddress)
    },
    getLabels(){
      currencyList.get(this.currency[this.currencyIndex].coinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
    },
    qr(){
      this.$emit("push",require("./qrcode.js"))
    },
    createLabel(){
      this.dialogVisible=false
      const cId = this.currency[this.currencyIndex].coinId
      const derivation = this.labelInput.split("/")
      if(derivation.length===3&&derivation[0]==="derive"){
        this.showLabel(cId,null,derivation[1]|0,derivation[2]|0)
        this.labelInput=""
      }else{
        currencyList.get(cId).createLabel(this.labelInput).then(()=>{
          this.labelInput=""
          this.getLabels()
        })
      }
    },
    showLabel(coinId,name,change,index){
      this.$store.commit("setLabelToShow",{coinId,name,index,change})
      this.$emit("push",require("./showLabel.js"))
    },
    createInvoice(){
      this.$emit("push",require("./invoice.js"))
    }
  },
  watch:{
    currencyIndex(){
      this.getMainAddress()
      this.getLabels()
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
    this.getMainAddress()
    this.getLabels()
  }
})
