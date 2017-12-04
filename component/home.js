const api=require("../js/api")
const coin=require("../js/coin")
module.exports=require("./home.html")({
  data(){
    return {
      balanceToShow:0,
      unitToShow:"mona",
      monaPrice:0,
      unconfirmedBalance:0
    }
  },
  methods:{
    push(){
      this.$emit("push",require("./send.js"))
    }
  },
  mounted(){
    api.getAddressProp(coin.getMonaAddress(0),"").then(res=>{
      this.balanceToShow=res.balance
      this.unconfirmedBalance=res.unconfirmedBalance
    })
    api.getPrice("mona","jpy").then(res=>{
      this.monaPrice=res
    })
  }
})
