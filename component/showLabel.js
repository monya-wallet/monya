const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("../js/lang.js")({ja:require("./ja/showLabel.html"),en:require("./en/showLabel.html")})({
  data(){
    return {
      address:"",
      qrDataUrl:"",
      isNative:false,
      label:"",
      edit:false,
      balance:0,
      labelInput:"",
      pubKey:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    copyAddress(){
      coinUtil.copy(currencyList.get(this.$store.state.showLabelPayload.coinId).bip21+":"+this.address)
    },
    update(){
      if(!this.labelInput){
        return
      }
      const p=this.$store.state.showLabelPayload
      currencyList.get(p.coinId).updateLabel(this.label,this.labelInput).then(()=>{
        this.edit=false;
        this.label=p.label=this.labelInput
        this.labelInput=""
        this.$emit("pop")
        this.$store.commit("setLabelToShow",p)
        this.$emit("push",module.exports)
      })
    }
  },
  mounted(){
    const p=this.$store.state.showLabelPayload
    const cur =currencyList.get(p.coinId)
    if(cur.bip44){
      this.hdPath="m/44'/"+cur.bip44.coinType+"'/"+cur.bip44.account+"'/"+p.change+"/"+p.index
    }else if(cur.bip49){
      this.hdPath="m/49'/"+cur.bip49.coinType+"'/"+cur.bip49.account+"'/"+p.change+"/"+p.index
    }
    this.label = p.name
    this.labelInput=p.name
    this.address=cur.getAddress(p.change,p.index)
    this.pubKey=cur.getPubKey(p.change,p.index)
    qrcode.toDataURL(cur.bip21+":"+this.address,{
      errorCorrectionLevel: 'M',
      type: 'image/png'
    },(err,url)=>{
      this.qrDataUrl=url
    })

    this.currentCurIcon=cur.icon

    cur.getAddressProp("balance",this.address).then(res=>{
      this.balance=res/100000000
    })
  }
})








