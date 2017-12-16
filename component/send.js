const coinUtil=require("../js/coinUtil")
const currencyList=require("../js/currencyList")
module.exports=require("./send.html")({
  data(){
    return {
      address:"",
      amount:0,
      fiat:0,
      feePerByte:0,
      message:"",
      balance:0,
      price:1,
      coinType:"",
      isEasy:this.$store.state.easyUnit,
      possibility:[],

      advanced:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    confirm(){
      if(!this.address||!this.coinType||!this.amount||!this.feePerByte||!coinUtil.isValidAddress(this.address)){
        
        this.$ons.notification.alert("正しく入力してね！")
        return;
      }
      this.$store.commit("setConfirmation",{
        address:this.address,
        amount:this.amount,
        fiat:this.fiat,
        feePerByte:this.feePerByte,
        message:this.message,
        coinType:this.coinType
      })
      this.$emit("push",require("./confirm.js"))
    },
    getPrice(){
      coinUtil.getPrice(this.coinType,"jpy").then(res=>{
        this.price=res
      })
    }
    
  },
  watch:{
    fiat(){
      this.amount=this.fiat/this.price
    },
    amount(){
      this.fiat=this.amount*this.price
    },
    address(){
      this.$set(this,"possibility",[])
      if(this.address){
        currencyList.eachWithPub((cur)=>{
          if(cur.prefixes.indexOf(this.address[0])>=0){
            this.possibility.push({
              name:cur.coinScreenName,
              coinId:cur.coinId
            })
          }
        })
        if(this.possibility[0]){
          this.coinType=this.possibility[0].coinId
        }else{
          this.coinType=""
        }
      }else{
        this.coinType=""
      }
    },
    coinType(){
      if(this.coinType){
        this.getPrice()
        this.feePerByte = currencyList.get(this.coinType).defaultFeeSatPerByte
      }
    }
  },
  mounted(){
    
  }
})
