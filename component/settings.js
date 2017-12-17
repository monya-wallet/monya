module.exports=require("./settings.html")({
  data(){
    return {

    }
  },
  methods:{
    goToShowPassphrase(){
      this.$emit("push",require("./showPassphrase.js"))
    }
    
  },
  mounted(){
    
  }
})
