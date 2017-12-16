const bip39 = require("bip39")
module.exports=require("./showPassphrase.html")({
  data(){
    return {
      keyArray:null,
      words:[]
    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      this.$emit("push",require("./setPassword.js"))
    }
  },
  mounted(){
    this.words=bip39.entropyToMnemonic(this.$store.state.entropy).split(" ");
  }
})
