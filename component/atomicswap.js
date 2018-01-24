
const currencyList = require("../js/currencyList")
const xmp = currencyList.get("mona")
const bitcoin = require("bitcoinjs-lib")
const storage = require("../js/storage")
const bip39 = require("bip39")
const coinUtil = require("../js/coinUtil")

module.exports=require("./atomicswap.html")({
  data(){
    return {
      labels:[],
      coins:[],
      
      addrIndex:0,
      giveCoinId:""
    }
  },
  methods:{
    getLabels(){
      currencyList.get(this.getCoinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
    },
    getCurrencies(){
      currencyList.eachWithPub(cur=>{
        this.coins.push(cur.coinId)
      })
    }
  },
  mounted(){
    this.getCurrencies()
  }
  
})
