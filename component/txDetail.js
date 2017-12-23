const currencyList = require("../js/currencyList")
const bcLib = require('bitcoinjs-lib')
module.exports=require("./txDetail.html")({
  data(){
    return {
      res:null,
      message:"",
      coinId:""
    }
  },
  mounted(){
    this.load()
  },
  store:require("../js/store.js"),
  methods:{
    load(){
      const cur = currencyList.get(this.$store.state.detail.coinId)
      this.coinId=cur.coinId
      cur.getTx(this.$store.state.detail.txId).then(v=>{
        this.res=v
        v.vout.forEach(o=>{
          if(o.scriptPubKey.hex.substr(0,2)==="6a"){
            this.message=bcLib.script.nullData.output.decode(new Buffer(o.scriptPubKey.hex,"hex")).toString('utf8')
          }
        })
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
    }
  }
})
