const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("../js/lang.js")({ja:require("./ja/signTx.html"),en:require("./en/signTx.html")})({
  data(){
    return {
      unsigned:"",
      signed:"",
      password:"",
      coinId:"",
      coins:[],
      labels:[],
      addrIndex:0,
      neededSig:0,
      pubs:[""],
      advanced:false,

      ins:[{
        txId:"",
        vout:"",
        sequence:""
      }],
      outs:[{
        addr:"",
        value:""
      }],
      lockTime:""
    }
  },
  methods:{
    sign(){
      storage.get("keyPairs").then((cipher)=>{
        const cur =currencyList.get(this.coinId)
        const txb=cur.lib.TransactionBuilder.fromTransaction(cur.lib.Transaction.fromHex(this.unsigned),cur.network)
        const pubKeyBufArr = this.pubs.map(v=>Buffer.from(v,"hex"))
        this.signed=cur.signMultisigTx({
          entropyCipher:cipher.entropy,
          password:this.password,
          txBuilder:txb,
          path:[0,this.addrIndex],
          pubKeyBufArr,
          neededSig:this.neededSig|0
        }).toHex()
        this.password=""
        
      }).catch(e=>{
        this.$store.commit("setError",e.message||"Unknown")
      })
    },
    goToReceive(){
      this.$emit("push",require("./receive.js"))
    },
    debug(){
      const cur =currencyList.get(this.coinId)
      Buffer;
      coinUtil;
      storage;
      debugger;
    },
    addPub(){
      if(this.pubs[this.pubs.length-1]){
        this.pubs.push("")
      }
    },
    removePub(i){
      this.pubs.splice(i,1)
    }
  },
  computed:{
    multisigAddr(){
      if(!this.coinId||!this.pubs.length||!this.neededSig){
        return
      }
      return currencyList.get(this.coinId).getMultisig(this.pubs.map(v=>Buffer.from(v,"hex")),this.neededSig).address
    },
    createdTx(){
      const cur=currencyList.get(this.coinId)
      try{
        const txb= new cur.lib.TransactionBuilder(cur.network)
        this.ins.forEach(v=>{
          txb.addInput(v.txId,v.vout|0,v.sequence||null)
        })
        this.outs.forEach(v=>{
          txb.addOutput(v.addr,parseInt(v.value))
        })
        this.lockTime&&txb.setLockTime(this.lockTime|0)
        return txb.buildIncomplete().toHex()
        
      }catch(e){
        return e
      }
    }
  },
  watch:{
    coinId(){
      const cur =currencyList.get(this.coinId)
      cur.getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
    },
    addrIndex(){
      this.debug()
    }
  },
  created(){
    currencyList.each(c=>{
      this.coins.push({
        coinId:c.coinId,
        name:c.coinScreenName
      })
    })
  },
  mounted(){
    this.coinId=this.coins[0].coinId
  }
})
