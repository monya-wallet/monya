
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
      giveCoinId:"",
      getCoinId:"",

      secret:"",

      secretHash:"",
      pubKeyWithSecret:"",
      pubKeyWOSecret:""
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
    },
    generateHash(){
      if(this.secret){
        this.secretHash = bitcoin.crypto.hash160(Buffer.from(this.secret,"utf8")).toString("hex")
        
      }else{
        this.secretHash =""
      }
      this.getPubKey()
    },
    getPubKey(){
      const pk=currencyList.get(this.getCoinId).getPubKey(0,this.addrIndex).toString("hex")
      if(this.secret){
        this.pubKeyWithSecret=pk
        this.pubKeyWOSecret=""
      }else{
        this.pubKeyWithSecret=""
        this.pubKeyWOSecret=pk
      }
      
    },
    generateP2SH(){

    }
  },
  mounted(){
    this.getCurrencies()
    
  }
  
})
