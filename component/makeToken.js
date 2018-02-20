const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")
const titleList = require("../js/titleList")

module.exports=require("../js/lang.js")({ja:require("./ja/makeToken.html"),en:require("./en/makeToken.html")})({
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
      transferDest:"",
      noFund:false
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
    checkFund(){
      const cur = titleList.get(this.titleId).cp
      const address = cur.getAddress(0,this.addressIndex|0)
      cur.getAddressProp("balance",address).then(r=>{
        if(r<50000){
          this.noFund=true
        }
      })
    },
    getAddrLabel(){
      currencyList.get(this.coinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
    },
    deposit(){
      const cur = titleList.get(this.titleId).cp
      const address = cur.getAddress(0,this.addressIndex|0)
      this.$store.commit("setSendUrl",`${cur.bip21}:${address}`)
      this.$emit("push",require("./send.js"))
      this.noFund=false
    }
  },
  mounted(){
    this.getAddrLabel()
    if(window.StatusBar){
      window.StatusBar.styleLightContent();
    }
    this.checkFund()
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
  watch:{
    addressIndex(){
      this.checkFund()
    }
  }
})
