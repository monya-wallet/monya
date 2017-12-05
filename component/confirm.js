const api=require("../js/api")
const coin = require("../js/coin.js")
module.exports=require("./confirm.html")({
  data(){
    return {
      address:"",
      mona:"",
      jpy:"",
      fee:0,
      destHasUsed:false,
      message:"",
      myBalanceBeforeSending:0,
      showDetail:false,
      utxosToShow:null,
      signedHex:null
    }
  },
  store:require("../js/store.js"),
  mounted(){
    ["address","mona","jpy","fee","message"].forEach(v=>{
      this[v]=this.$store.state.confPayload[v]
    })
    this.myAddress=coin.getAddress("mona",0)
    api.getAddressProp(this.address,"totalReceived").then(res=>{
      this.destHasUsed=!!res
    })
    api.getAddressBal(this.myAddress,false).then(res=>{
      this.myBalanceBeforeSending=res
      let amt2Wd = this.fee+this.mona
      if(amt2Wd<=res){
        return coin.selectUtxos(this.myAddress,amt2Wd)
      }else{
        throw new Error("Insufficient fund")
      }
    }).then(utxos=>{
      this.utxosToShow=utxos;
      return coin.buildTransaction({
        coinId:"mona",
        keyIndex:0,
        message:this.message,
        amount:this.mona,
        fee:this.fee,
        address:this.address,
        changeAddress:this.myAddress,
        utxos
      })
    }).then(hex=>{
      this.signedHex=hex
    })
  },
  computed:{
    afterSent(){
      return (this.myBalanceBeforeSending*100000000-this.mona*100000000-this.fee*100000000)/100000000
    }
  },
  methods:{
    next(){
      
      
      this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent"})
      this.$emit("replace",require("./finished.js"))
    }
  }
})
