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
      complete:false,

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
          neededSig:this.neededSig|0,
          complete:this.complete
        }).toHex()
        this.password=""
        
      }).catch(e=>{
        this.$store.commit("setError",e.message||"Unknown")
      })
    },
    goToReceive(){
      this.$emit("push",require("./receive.js"))
    },
    
    addPub(){
      
      this.pubs.push("")
      
    },
    removePub(i){
      this.pubs.splice(i,1)
    },
    broadcast(){
      currencyList.get(this.coinId).pushTx(this.signed).then((res)=>{
        this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent",payload:{
          txId:res.txid
        }})
        this.$emit("replace",require("./finished.js"))

        
      }).catch(e=>{
        this.loading=false
        if(e.request){
          this.$store.commit("setError",e.request.responseText||"Network Error.Please try again")
          
        }else{
          this.$store.commit("setError",e.message)
        }
      })
    }
  },
  computed:{
    multisigAddr(){
      try{
        return currencyList.get(this.coinId).getMultisig(this.pubs.map(v=>Buffer.from(v,"hex")),this.neededSig).address
      }catch(e){
        return 
      }
    },
    createdTx(){
      const cur=currencyList.get(this.coinId)
      try{
        const txb= new cur.lib.TransactionBuilder(cur.network)
        this.ins.forEach(v=>{
          txb.addInput(v.txId,v.vout|0,parseInt(v.sequence)||null)
        })
        this.outs.forEach(v=>{
          txb.addOutput(v.addr,parseInt(v.value))
        })
        this.lockTime&&txb.setLockTime(parseInt(this.lockTime)|0)
        return txb.buildIncomplete().toHex()
        
      }catch(e){
        return ""
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
    unsigned(){
      try{
      const lib =currencyList.get(this.coinId).lib
      const decompiled=lib.script.decompile(lib.Transaction.fromHex(this.unsigned).ins[0].script)
      
      const decoded=lib.script.multisig.output.decode(decompiled[decompiled.length-1])
      const pks=decoded.pubKeys
      if(pks.length){
        this.pubs=[]
        pks.forEach(p=>{
          this.pubs.push(p.toString("hex"))
        })
        this.neededSig=decoded.m
      }
      if(decompiled.length<=2){
        return
      }
      let validSigLen=0
      for(let i=1;i<decompiled.length-1;i++){
        if(decompiled[i]){
          validSigLen++
        }
      }
        this.complete=(this.neededSig<=validSigLen+1)
      }catch(e){
        return
      }
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
