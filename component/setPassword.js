const coinUtil = require("../js/coinUtil.js")
const currencyList = require("../js/currencyList.js")
const crypto = require('crypto');
const storage = require("../js/storage.js")
const blacklist=["123456","114514","password","password2"]
module.exports=require("./setPassword.html")({
  data(){
    return {
      passwordType:"password",
      currentPassword:"",
      password:"",
      password2:"",
      change:false,
      error:false,
      loading:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      if(!this.password||this.password!==this.password2||this.password.length<6){
        return;
      }
      if(blacklist.indexOf(this.password)>=0){
        this.$ons.notification.alert(this.password+"は禁止!")
        return
      }
      this.loading=true
      let cipherPromise=null;
      if(this.change){
        cipherPromise=storage.get("keyPairs").then((cipher)=>coinUtil.makePairsAndEncrypt({
          entropy:coinUtil.decrypt(cipher.entropy,this.currentPassword),
          password:this.password,
          makeCur:Object.keys(cipher.pubs)
        }))
      }else{
        currencyList.init([])
        cipherPromise=storage.get("settings").then(s=>{
          if(!s){
            storage.set("settings",{monappy:{},zaifPay:{}})
          }
          return coinUtil.makePairsAndEncrypt({
            entropy:this.$store.state.entropy,
            password:this.password,
            makeCur:["mona"]
          })
        })
      }
      cipherPromise.then((data)=>storage.set("keyPairs",data))
        .then(()=>{
          this.$store.commit("deleteEntropy")
          this.$store.commit("setFinishNextPage",{page:require("./login.js"),infoId:"createdWallet"})
          this.$emit("replace",require("./finished.js"))
          
        }).catch(e=>{
          this.error=e.message||true
          this.loading=false
        })
    }
    
  },
  mounted(){
    if(this.$store.state.entropy){
      this.change=false
    }else{
      this.change=true
    }
  },
  components:{
    
  }
})
