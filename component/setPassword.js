const coinUtil = require("../js/coinUtil.js")
const crypto = require('crypto');
const storage = require("../js/storage.js")
module.exports=require("./setPassword.html")({
  data(){
    return {
      passwordType:"password",
      currentPassword:"",
      password:"",
      password2:"",
      change:false,
      error:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      if(!this.password||this.password!==this.password2){
        return;
      }
      let cipherPromise=null;
      if(this.change){
        cipherPromise=storage.get("keyPairs").then((cipher)=>coinUtil.makePairsAndEncrypt({
          entropy:coinUtil.decrypt(cipher.entropy,this.currentPassword),
          password:this.password,
          makeCur:["mona"]
        }))
      }else{
        cipherPromise=coinUtil.makePairsAndEncrypt({
          entropy:this.$store.state.entropy,
          password:this.password,
          makeCur:["mona"]
        })
      }
      cipherPromise.then((data)=>storage.set("keyPairs",data))
        .then(()=>{
          this.$store.commit("deleteEntropy")
          this.$store.commit("setFinishNextPage",{page:require("./login.js"),infoId:"createdWallet"})
          this.$emit("replace",require("./finished.js"))
          
        }).catch(()=>{
          this.error=true
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
