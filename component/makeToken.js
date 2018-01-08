const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")

module.exports=require("./makeToken.html")({
  data(){
    return {
    token:"",
    coinId:this.$store.state.coinId,
    labels:[],
    addressIndex:0,
    loading:false,
      divisible:true,
    password:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      const cur = currencyList.get(this.coinId)
      let hex=""
      let qty=(new BigNumber(this.amount)).toNumber()
      if(this.divisible){
        qty*=100000000
      }
      cur.callCPLib("create_issuance",{
        source:cur.getAddress(0,this.addressIndex|0),
        allow_unconfirmed_inputs:this.$store.state.includeUnconfirmedFunds,
        destination:this.dest,
        asset:this.token.toUpperCase(),
        quantity:qty,//satoshi
        description:this.description,
        fee_per_kb:cur.defaultFeeSatPerByte*1024,
        disable_utxo_locks:true,
        encoding:"auto",
        extended_tx_info:true,
        divisible:this.divisible,
        pubkey:[cur.getPubKey(0,this.addressIndex|0)]
      }).then(res=>{
        hex=res.result.tx_hex
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
        this.$ons.notification.alert("Successfully sent transaction.Transaction ID is: "+r.result)
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
