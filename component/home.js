const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
module.exports=require("./home.html")({
  data(){
    return {
      curs:[],
      fiatConv:0,
      fiat:this.$store.state.fiat,
      loading:false,
      state:"initial",
      error:false
    }
  },
  methods:{
    qr(){
      
      this.$emit("push",require("./qrcode.js"))
    },
    load(done){
      this.curs=[]
      this.fiatConv=0
      this.loading=true;
      this.error=false
      currencyList.eachWithPub(cur=>{
        
        let bal=null;
        cur.getWholeBalanceOfThisAccount()
          .then(res=>{
            bal=res
            
            return coinUtil.getPrice(cur.coinId,this.$store.state.fiat)
          })
          .then(res=>{
            this.fiatConv += res*bal.balance
            this.curs.push({
              coinId:cur.coinId,
              balance:bal.balance,
              unconfirmed:bal.unconfirmed,
              screenName:cur.coinScreenName,
              price:res,
              icon:cur.icon
            })
            this.loading=false
            typeof(done)==='function'&&done()
          })
          .catch(()=>{
            this.error=true
            this.loading=false
            typeof(done)==='function'&&done()
          })
      })
    },
    goToManageCoin(){
      this.$emit("push",require("./manageCoin.js"))
    },
    receive(){
      this.$emit("push",require("./receive.js"))
    },
    send(){
      this.$emit("push",require("./send.js"))
    },
    history(){
      this.$emit("push",require("./history.js"))
    },
    settings(){
      this.$emit("push",require("./settings.js"))
    },
  },
  store:require("../js/store.js"),
  mounted(){
    this.load()
  }
})
