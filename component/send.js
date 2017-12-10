const api=require("../js/api")
const Currency=require("../js/currency")
const currencyList=require("../js/currencyList")
module.exports=require("./send.html")({
  data(){
    return {
      address:"",
      mona:0,
      jpy:0,
      fee:0.0006,
      message:"",
      balance:0,
      monaPrice:0,
      coinType:"",
      isEasy:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    confirm(){
      if(!this.address||!this.mona||!this.fee||!Currency.isValidAddress(this.address)){
        
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
    },
    address(){
      const possibility=[]
      for(let coinId in currencyList){
        if(currencyList[coinId].prefixes.indexOf(this.address[0])>=0){
          possibility.push(coinId)
        }
      }
      if(possibility.length===1){
        this.coinType=possibility[0]
      }else if(possibility.length===0){

      }else{}
    }
  },
  mounted(){
    
  }
})
