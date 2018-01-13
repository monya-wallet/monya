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
      let timer=setTimeout(()=>{
        this.loading=false
      },10000)
      const promises=[]
      currencyList.eachWithPub(cur=>{
        let obj={
          coinId:cur.coinId,
          balance:0,
          unconfirmed:0,
          screenName:cur.coinScreenName,
          price:0,
          icon:cur.icon
        }
        
        promises.push(cur.getWholeBalanceOfThisAccount()
          .then(res=>{
            obj.balance=res.balance
            obj.unconfirmed=res.unconfirmed
            this.curs.push(obj)
            return coinUtil.getPrice(cur.coinId,this.$store.state.fiat)
          }).then(res=>{
            this.fiatConv += res*obj.balance
            obj.price=res
            return obj
          }).catch(()=>{
            this.error=true
            obj.screenName=""
            return obj
          }))
      })
      Promise.all(promises).then(data=>{
        this.curs=data
        this.loading=false
        clearTimeout(timer)
        typeof(done)==='function'&&done()
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
