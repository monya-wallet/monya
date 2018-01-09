const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")

module.exports=require("./sendToken.html")({
  data(){
    return {
    token:this.$store.state.tokenInfo,
      coinId:this.$store.state.coinId,
      divisible:this.$store.state.divisible,
    labels:[],
    addressIndex:0,
    loading:false,
    dest:"",
    sendAmount:0,
    sendMemo:"",
    password:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      const cur = currencyList.get(this.coinId)
      let hex=""
      let qty=(new BigNumber(this.sendAmount))
      if(this.divisible){
        qty=qty.times(100000000)
      }
      cur.callCPLib("create_send",{
        source:cur.getAddress(0,this.addressIndex|0),
        allow_unconfirmed_inputs:this.$store.state.includeUnconfirmedFunds,
        destination:this.dest,
        asset:this.token.toUpperCase(),
        quantity:qty.toNumber(),
        memo:this.sendMemo,
        fee_per_kb:cur.defaultFeeSatPerByte*1024,
        disable_utxo_locks:true,
        encoding:"auto",
        extended_tx_info:true,
        pubkey:[cur.getPubKey(0,this.addressIndex|0)]
      }).then(res=>{
        hex=res.tx_hex
        return storage.get("keyPairs")
      }).then(cipher=>{
        const signedTx=cur.signTx({
          hash:hex,
          password:this.password,
          path:[[0,this.addressIndex|0]],
          entropyCipher:cipher.entropy
        })
        return cur.callCP("broadcast_tx",{signed_tx_hex:signedTx.toHex()})
      }).then(r=>{
        this.loading=false
        this.$ons.notification.alert("Successfully sent transaction.Transaction ID is: "+r)
      }).catch(e=>{
        this.loading=false
        this.$ons.notification.alert("Error: "+e.message)
      })
    },
    
    getAddrLabel(){
      currencyList.get(this.coinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
    }
  },
  mounted(){
    this.getAddrLabel()
  }
})
