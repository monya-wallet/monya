const currencyList = require("../js/currencyList")
const titleList = require("../js/titleList")

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
      password:"",
      feePerByte:200
    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      titleList.get(this.titleId).createTx({
        divisible:this.divisible,
        sendAmount:this.sendAmount,
        addressIndex:this.addressIndex,
        dest:this.dest,
        token:this.token,
        includeUnconfirmedFunds:this.$store.state.includeUnconfirmedFunds,
        password:this.password,
        memo:this.sendMemo,
        feePerByte:this.feePerByte
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
  computed:{
    titleId:{
      get(){
        return this.$store.state.monapartyTitle
      },
      set(v){
        this.$store.commit("setTitle",v)
        return v
      }
    }
  },
  mounted(){
    this.getAddrLabel()
  }
})
