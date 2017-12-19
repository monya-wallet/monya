const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("./showLabel.html")({
  data(){
    return {
      address:"",
      qrDataUrl:"",
      isNative:false,
      label:"",
      edit:false,
      balance:0,
      labelInput:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    copyAddress(){
      
    },
    update(){
      const p=this.$store.state.showLabelPayload
      coinUtil.updateLabel(p.coinId,this.label,this.labelInput).then(()=>{
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
    this.hdPath="m/44'/"+cur.bip44.coinType+"'/"+cur.bip44.account+"'/"+p.change+"/"+p.index
    this.label = p.name
    this.labelInput=p.name
    this.address=cur.getAddress(p.change,p.index)
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








