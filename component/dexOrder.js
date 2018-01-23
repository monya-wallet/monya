const currencyList = require("../js/currencyList")
const titleList = require("../js/titleList")

module.exports=require("./dexOrder.html")({
  data(){
    return {
      coinId:this.$store.state.coinId,
      labels:[],
      addressIndex:0,
      loading:false,
      password:"",
      feePerByte:200,
      getAmount:0,
      giveAmount:0,
      giveToken:"",
      getToken:""

    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      titleList.get(this.titleId).createOrder({
        addressIndex:this.addressIndex,
        includeUnconfirmedFunds:this.$store.state.includeUnconfirmedFunds,
        password:this.password,
        feePerByte:this.feePerByte,
        giveAmt:this.giveAmount,
        giveToken:this.giveToken,
        getAmt:this.getAmount,
        getToken:this.getToken
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
    if(window.StatusBar){
      window.StatusBar.styleLightContent();
    }
  }
})
