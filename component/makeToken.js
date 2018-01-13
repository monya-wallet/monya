const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")
const titleList = require("../js/titleList")

module.exports=require("./makeToken.html")({
  data(){
    return {
    token:"",
    coinId:this.$store.state.coinId,
    labels:[],
    addressIndex:0,
    loading:false,
      divisible:false,
      password:"",
      feePerByte:"",
      description:"",
      transferDest:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      titleList.get(this.titleId).createIssuance({
        divisible:this.divisible,
        amount:this.amount,
        addressIndex:this.addressIndex,
        token:this.token,
        includeUnconfirmedFunds:this.$store.state.includeUnconfirmedFunds,
        password:this.password,
        memo:this.sendMemo,
        feePerByte:this.feePerByte,
        description:this.description,
        transferDest:this.transferDest
      }).then(r=>{
        this.loading=false
        this.$ons.notification.alert("Successfully sent transaction.Transaction ID is: "+r)
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)

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
  },computed:{
    titleId:{
      get(){
        return this.$store.state.monapartyTitle
      },
      set(v){
        this.$store.commit("setTitle",v)
        return v
      }
    }
  }
})
