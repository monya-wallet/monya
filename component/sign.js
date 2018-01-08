const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
module.exports=require("./sign.html")({
  data(){
    return {
      address:"",
      message:"",
      signature:"",
      password:"",
      dlg:false,
      result:false,
      possibility:[],
      coinType:""
    }
  },
  methods:{
    sign(){
      storage.get("keyPairs").then((cipher)=>{
        this.signature=currencyList.get(this.coinType).signMessage(this.message,cipher.entropy,this.password,this.path)
        this.password=""
      }).catch(e=>{
        this.$ons.notification.alert(e.message||"Error.Please try again")
      })
    },
    verify(){
      this.result=currencyList.get(this.coinType).verifyMessage(this.message,this.address,this.signature)
      this.dlg=true
    }
  },
  watch:{
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
        this.path=currencyList.get(this.coinType).getIndexFromAddress(this.address)
      }else{
        this.path=false
      }
    }
  }
})
