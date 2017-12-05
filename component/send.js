const api=require("../js/api")
const coin=require("../js/coin")
module.exports=require("./send.html")({
  data(){
    return {
      address:"",
      mona:0,
      jpy:0,
      fee:0.0006,
      message:"",
      balance:0,
      monaPrice:0
    }
  },
  store:require("../js/store.js"),
  methods:{
    confirm(){
      if(!this.address||!this.mona||!this.fee||!coin.isValidAddress(this.address)){
        
        this.$ons.notification.alert("正しく入力してね！")
        return;
      }
      this.$store.commit("setConfirmation",{
        address:this.address,
        mona:this.mona,
        jpy:this.jpy,
        fee:this.fee,
        message:this.message
      })
      this.$emit("push",require("./confirm.js"))
    }
    
  },
  watch:{
    jpy(){
      this.mona=this.jpy/this.monaPrice
    },
    mona(){
      this.jpy=this.mona*this.monaPrice
    }
  },
  mounted(){
    api.getAddressBal(coin.getAddress("mona",0),true).then(res=>{
      this.balance=res
    })
    api.getPrice("mona","jpy").then(res=>{
      this.monaPrice=res
    })
  }
})
