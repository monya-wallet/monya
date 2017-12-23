const storage = require("../js/storage.js")
const coinUtil=require("../js/coinUtil")
const currencyList = require("../js/currencyList")
const bcLib = require('bitcoinjs-lib')
const errors = require("../js/errors")
module.exports=require("./confirm.html")({
  data(){
    return {
      address:"",
      amount:"",
      fiat:"",
      feePerByte:0,
      fee:0,
      destHasUsed:false,
      message:"",
      myBalanceBeforeSending:0,
      showDetail:false,
      utxosToShow:null,
      signedHex:null,
      isEasy:false,
      coinType:"",
      ready:false,
      txb:null,
      addressPath:null,
      password:"",
      cur:null,
      insufficientFund:false,
      loading:true
      
    }
  },
  store:require("../js/store.js"),
  mounted(){
    ["address","amount","fiat","feePerByte","message","coinType"].forEach(v=>{
      this[v]=this.$store.state.confPayload[v]
    })
    this.cur=currencyList.get(this.coinType)
    this.$nextTick(this.build)
    currencyList.get(this.coinType).getAddressProp("totalReceived",this.address).then(res=>{
      if(res|0){
        this.destHasUsed=true
      }
    })
  },
  computed:{
    afterSent(){
      return (this.myBalanceBeforeSending-this.amount-this.fee)
    },
    utxosJson(){
      return JSON.stringify(this.utxosToShow)
    },
    build(){
      
      const cur =this.cur
      const targets = [{
        address:this.address,
        value:this.amount*100000000
      }];
      if(this.message){
        targets.push({
          address:bcLib.script.nullData.output.encode(Buffer.from(this.message, 'utf8')),
          value:0
        })
      }
      cur.buildTransaction({
        targets,
        feeRate:this.feePerByte
      }).then(d=>{
        this.fee=d.fee/100000000
        this.utxosToShow=d.utxos
        this.path=d.path
        this.myBalanceBeforeSending=d.balance
        this.txb=d.txBuilder
        this.ready=true
        this.loading=false
      }).catch(e=>{
        this.ready=false
        this.loading=false
        if(e instanceof errors.NoSolutionError){
          this.insufficientFund=true
        }else{
          console.log(e)
        }
      })
    }
  },
  methods:{
    next(){
      this.loading=true
      const cur=this.cur
      this.ready=false
      storage.get("keyPairs").then((cipher)=>{
        const finalTx=cur.signTx({
          entropyCipher:cipher.entropy,
          password:this.password,
          txBuilder:this.txb,
          path:this.path
        })
        return cur.pushTx(finalTx.toHex())
      }).then((res)=>{
        this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent",payload:{
          txId:res.txid
        }})
        this.$emit("replace",require("./finished.js"))
      }).catch(e=>{
        this.loading=false
        this.$ons.notification.alert(e.request.responseText)
      })
      
      
    }
  }
})
