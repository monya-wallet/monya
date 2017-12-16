const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
module.exports=require("./home.html")({
  data(){
    return {
      curs:[],
      isEasy:true,
      fiatConv:0,
      fiat:this.$store.state.fiat
    }
  },
  methods:{
    push(){
      this.$emit("push",require("./send.js"))
    }
  },
  store:require("../js/store.js"),
  mounted(){
    currencyList.eachWithPub(cur=>{
      let bal=0;
      cur.getWholeBalanceOfThisAccount()
        .then(res=>{
          bal=res.balance
          return coinUtil.getPrice(cur.coinId,this.$store.state.fiat)
        })
        .then(res=>{
          this.fiatConv += res*bal/100000000
          this.curs.push({
            coinId:cur.coinId,
            balance:bal/100000000,
            screenName:cur.coinScreenName,
            price:res,
            icon:cur.icon,
          })
        })
    })
  }
})
