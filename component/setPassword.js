const coinUtil = require("../js/coinUtil.js")
const currencyList = require("../js/currencyList.js")
const crypto = require('crypto');
const storage = require("../js/storage.js")
const errors=require("../js/errors")
const template = require("../lang/template.json")

const blacklist=["123456","114514","password","password2"]
module.exports=require("../js/lang.js")({ja:require("./ja/setPassword.html"),en:require("./en/setPassword.html")})({
  data(){
    return {
      passwordType:"password",
      currentPassword:"",
      password:"",
      password2:"",
      change:false,
      error:false,
      loading:false,
      biometric:true,
      biometricAvailable:false,
      encrypt:false,
      encrypted:false,
      answers:this.$store.state.answers
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
        if(this.encrypt||this.encrypted){// if already encrypted, always encrypt
          storage.setEncryption(this.password)
        }
      }else{
        currencyList.init([])
        const exts=[]
        if(this.answers[5]==="xrp"){
          exts.push("xrp")
        }
        if(this.answers[5]==="xem"){
          exts.push("nem")
        }
        if(this.answers[9]){
          exts.push("zaifPay")
        }
        

        cipherPromise = storage.set("settings",{
          includeUnconfirmedFunds:false,
          useEasyUnit:!!this.answers[8],
          absoluteTime:false,
          fiat:"jpy",
          paySound:false,
          monappy:{
            enabled:false,
            myUserId:""
          },
          monaparty:{
            bgClass:"sand"
          },
          enabledExts:exts
        })
          .then(()=>storage.set("question",this.answers))
          .then(()=>coinUtil.makePairsAndEncrypt({
            entropy:this.$store.state.entropy,
            password:this.password,
            makeCur:[template["<!--t:primaryCoinId-->"]||"mona"]
          }))
      }
      cipherPromise.then((data)=>storage.set("keyPairs",data))
        .then(()=>{
          this.$store.commit("deleteEntropy")
          this.$store.commit("setFinishNextPage",{page:require("./login.js"),infoId:"createdWallet"})
          this.$emit("replace",require("./finished.js"))
          if(this.biometric){
            return storage.setBiometricPassword(this.password)
          }
        })
        .catch(e=>{
          if(!(e instanceof errors.BiometricError)){
            this.error=e.message||true
            this.loading=false
          }
        })
    }
    
  },
  created(){
    if(this.$store.state.entropy){
      this.change=false
    }else{
      this.change=true
    }
    storage.isBiometricAvailable().then(flag=>{
      this.biometricAvailable=flag
      this.biometric=flag
    })
    storage.dataState().then(flag=>{
      if(flag===2){
        this.encrypted=true
        this.encrypt=true
      }
    })
  }
})
