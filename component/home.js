const api=require("../js/api")
const currencyList = require("../js/currencyList")
const coin=require("../js/coin")
module.exports=require("./home.html")({
  data(){
    return {
      balances:[],
      isEasy:true,
      jpyConv:0
    }
  },
  methods:{
    push(){
      this.$emit("push",require("./send.js"))
    }
  },
  mounted(){
    for(let coinId in currencyList){
      currencyList[coinId].getWholeBalanceOfThisAccount().then(res=>{
        this.balances.push([coinId,res/100000000])
      })
    }
  }
})
