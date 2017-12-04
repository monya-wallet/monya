const coin = require("../js/coin.js")
const storage = require("../js/storage.js")
module.exports=require("./login.html")({
  data(){
    return {
      showPassword:false,
      password:"",
      incorrect:false
    }
  },
  methods:{
    start(){
      storage.get("encryptedPriv").then((cipher)=>{
        return coin.decryptAndRestore(cipher,this.password)
      }).then(()=>{
        this.$emit("replace",require("./home.js"))
      }).catch(()=>{
        this.incorrect=true;
        setTimeout(()=>{
          this.incorrect=false;
        },1000)
      })
    }
  },
  mounted(){
    
  }
})
