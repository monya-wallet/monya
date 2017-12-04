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
      message:""
    }
  },
  store:require("../js/store.js"),
  mounted(){
    ["address","mona","jpy","fee","message"].forEach(v=>{
      this[v]=this.$store.state.confPayload[v]
    })
    this.myAddress=coin.getMonaAddress(0)
    api.getAddressProp(this.address,"totalReceived").then(res=>{
      this.destHasUsed=!!res
    })
     api.getAddressProp(this.myAddress,"balance").then(res=>{
      this.myBalanceBeforeSending=res
    })
  },
  methods:{
    next(){
      //送金処理
      this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent"})
      this.$emit("replace",require("./finished.js"))
    }
  }
})
