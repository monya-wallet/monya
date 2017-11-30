const securityManager = require("../js/securityManager")
module.exports=require("./showPassphrase.html")({
  data(){
    return {
      keyArray:null,
      words:[]
    }
  },
  methods:{
    next(){
      this.$emit("push",require("./setPassword.js"))
    }
    
  },
  mounted(){
    this.$emit("getParam",param => {
      securityManager.getWordsFromArray(param.keyArray).then(words=>{
        this.words=words;
        this.$emit("setParam",{keyArray:param.keyArray})
      })
      
    })
  },
  components:{
    
  }
})










