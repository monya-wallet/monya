const coin = require("../js/coin.js")
const crypto = require('crypto');
const storage = require("../js/storage.js")
module.exports=require("./setPassword.html")({
  data(){
    return {
      passwordType:"password",
      password:"",
      password2:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      if(!this.password||this.password!==this.password2){
        return;
      }
      coin.makePairsAndEncrypt({
        entropy:this.$store.state.entropy,
        password:this.password
      }).then((data)=>storage.set("keyPairs",data))
        .then(()=>{
          this.$store.commit("setFinishNextPage",{page:require("./login.js"),infoId:"createdWallet"})
          this.$emit("replace",require("./finished.js"))
      })
    }
    
  },
  mounted(){
   
  },
  components:{
    
  }
})
