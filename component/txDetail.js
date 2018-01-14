const currencyList = require("../js/currencyList")
const bcLib = require('bitcoinjs-lib')
module.exports=require("./txDetail.html")({
  data(){
    return {
      res:null,
      message:"",
      fiat:this.$store.state.fiat,
      coinId:this.$store.state.detail.coinId,
      price:0,
      txId:this.$store.state.detail.txId,
      txLabel:""
      
    }
  },
  mounted(){
    this.load()
  },
  store:require("../js/store.js"),
  methods:{
    load(){
      const cur = currencyList.get(this.coinId)
      this.coinId=cur.coinId
      const txProm = cur.getTx(this.txId).then(v=>{
        this.res=v
        v.vout.forEach(o=>{
          if(o.scriptPubKey.hex.substr(0,2)==="6a"){
            this.message=bcLib.script.nullData.output.decode(new Buffer(o.scriptPubKey.hex,"hex")).toString('utf8')
          }
        })
      })
      const labelProm=cur.getTxLabel(this.txId).then(res=>{
        this.price=res.price||""
        this.txLabel=res.label
      })
      Promise.all([txProm,labelProm]).then(()=>{
        this.saveTxLabel()
      })
    },
    txDetail(txId){
      if(!txId){
        return
      }
      this.$store.commit("setTxDetail",{
        txId,coinId:this.coinId
      })
      this.$emit("push",module.exports)
    },
    addressClass(addr){
      const addrTuple=currencyList.get(this.coinId).getIndexFromAddress(addr)
      if(!addrTuple)return ""
      if(parseInt(addrTuple[0],10)===0)return "receive"
      if(parseInt(addrTuple[0],10)===1)return "change"
    },
    saveTxLabel(){
      currencyList.get(this.coinId).saveTxLabel(this.txId,{read:true,label:this.txLabel,price:parseFloat(this.price)})
    }
  }
})










