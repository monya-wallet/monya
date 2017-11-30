const securityManager = require("../js/securityManager")
module.exports=require("./setPassword.html")({
  data(){
    return {
      passwordType:"password",
      password:"",
      password2:""
    }
  },
  methods:{
    next(){
      //this.$emit("push",require("./generateKey.js"))
    }
    
  },
  mounted(){
    this.$emit("getParam",param => {
      securityManager.getWordsFromArray(param.keyArray).then(words=>{
        this.words=words;
        
      })
      
    })
  },
  components:{
    
  }
})
